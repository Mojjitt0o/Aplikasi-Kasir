// controllers/transactionController.js
const db = require('../config/db');
const { sendTelegramMessage } = require('../utils/telegram');

// **Kirim Notifikasi ke Telegram**
const sendTransactionNotification = (transactionId) => {
    db.query("SELECT * FROM transactions WHERE id = ?", [transactionId])
        .then(([result]) => {
            const transaction = result[0];
            sendTelegramMessage(
                `💵 Transaksi Baru:\nID Transaksi: ${transactionId}\nTotal: ${transaction.grand_total}\nMetode Pembayaran: ${transaction.metode_pembayaran}`
            );
        })
        .catch((err) => {
            console.error('Error fetching transaction for notification:', err);
        });
};

// **Kurangi Stok Produk**
const updateProductStock = (items) => {
    items.forEach(item => {
        db.query("UPDATE produk SET stok = stok - ? WHERE id = ?", [item.quantity, item.product_id])
            .then(() => {
                console.log(`Stok produk ${item.product_id} berhasil dikurangi.`);
            })
            .catch((err) => {
                console.error('Error updating stock:', err);
            });
    });
};

// **Buat Transaksi Baru**
const createTransaction = (req, res) => {
    const { user_id, items, discount = 0, pajak = 0, metode_pembayaran } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Tidak ada item dalam transaksi' });
    }

    let total = 0;
    items.forEach(item => {
        total += item.price * item.quantity;
    });

    const validDiscount = isNaN(discount) ? 0 : parseFloat(discount);
    const validTax = isNaN(pajak) ? 0 : parseFloat(pajak);

    const grandTotal = total - validDiscount + validTax;

    db.query("INSERT INTO transactions (user_id, total, discount, pajak, grand_total, metode_pembayaran) VALUES (?, ?, ?, ?, ?, ?)",
        [user_id, total, validDiscount, validTax, grandTotal, metode_pembayaran]
    )
    .then(([result]) => {
        const transactionId = result.insertId;

        const detailsQuery = "INSERT INTO detail_transaksi (transaksi_id, produk_id, jumlah, harga, total_harga) VALUES ?";
        const detailsValues = items.map(item => [transactionId, item.product_id, item.quantity, item.price, item.price * item.quantity]);

        return db.query(detailsQuery, [detailsValues])
            .then(() => {
                updateProductStock(items);
                sendTransactionNotification(transactionId);

                res.json({ status: 'success', message: 'Transaksi berhasil dibuat', transactionId });
            });
    })
    .catch((err) => {
        console.error('Error creating transaction:', err);
        res.status(500).json({ error: 'Gagal membuat transaksi' });
    });
};

// **Lihat Semua Transaksi**
const getTransactions = (req, res) => {
    db.query("SELECT * FROM transactions ORDER BY created_at DESC")
        .then(([results]) => {
            res.json(results);
        })
        .catch((err) => {
            console.error('Error fetching transactions:', err);
            res.status(500).json({ error: 'Gagal mengambil data transaksi' });
        });
};

// **Lihat Detail Transaksi**
const getTransactionDetails = (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM transactions WHERE id = ?", [id])
        .then(([result]) => {
            if (result.length === 0) {
                return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            }

            return db.query("SELECT * FROM detail_transaksi WHERE transaksi_id = ?", [id])
                .then(([details]) => {
                    res.json({ transaction: result[0], details });
                });
        })
        .catch((err) => {
            console.error('Error fetching transaction details:', err);
            res.status(500).json({ error: 'Gagal mengambil detail transaksi' });
        });
};

// **Batalkan Transaksi & Kembalikan Stok**
const cancelTransaction = (req, res) => {
    const { transactionId } = req.body;

    db.query("SELECT * FROM detail_transaksi WHERE id = ?", [transactionId])
        .then(([details]) => {
            if (details.length === 0) {
                return res.status(404).json({ error: 'Transaksi tidak ditemukan atau sudah dihapus' });
            }

            details.forEach(item => {
                db.query("UPDATE produk SET stok = stok + ? WHERE id = ?", [item.quantity, item.product_id])
                    .then(() => {
                        console.log(`Stok produk ${item.product_id} berhasil dikembalikan.`);
                    })
                    .catch((err) => {
                        console.error('Error restoring stock:', err);
                    });
            });

            return db.query("DELETE FROM transactions WHERE id = ?", [transactionId])
                .then(() => {
                    res.json({ message: 'Transaksi berhasil dibatalkan' });
                });
        })
        .catch((err) => {
            console.error('Error cancelling transaction:', err);
            res.status(500).json({ error: 'Error cancelling transaction' });
        });
};

// **Laporan Penjualan Harian**
const getDailyReport = (req, res) => {
    const sql = `
        SELECT DATE(created_at) AS date, SUM(total) AS total_sales, SUM(discount) AS total_discount, SUM(pajak) AS total_tax
        FROM transactions
        WHERE DATE(created_at) = CURDATE()
        GROUP BY DATE(created_at)
    `;

    db.query(sql)
        .then(([result]) => {
            res.json(result);
        })
        .catch((err) => {
            console.error('Error generating report:', err);
            res.status(500).json({ error: 'Error generating report' });
        });
};

// **Produk Terlaris**
const getTopSellingProducts = (req, res) => {
    const sql = `
        SELECT p.nama, SUM(td.quantity) AS total_sold
        FROM transaction_details td
        JOIN produk p ON td.product_id = p.id
        GROUP BY td.product_id
        ORDER BY total_sold DESC
        LIMIT 5
    `;

    db.query(sql)
        .then(([result]) => {
            res.json(result);
        })
        .catch((err) => {
            console.error('Error fetching top-selling products:', err);
            res.status(500).json({ error: 'Error fetching top-selling products' });
        });
};

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionDetails,
    cancelTransaction,
    getDailyReport,
    getTopSellingProducts,
    sendTransactionNotification
};


// // Koneksi ke printer via USB
// const device = new USB(); 
// const printer = new escpos.Printer(device);

// const printReceipt = (transaction) => {
//     device.open((err) => {
//         if (err) {
//             console.error('Error connecting to printer:', err);
//             return;
//         }

//         printer
//             .align('ct') // Tengah
//             .text('=== STRUK TRANSAKSI ===')
//             .text(`ID: ${transaction.id}`)
//             .text(`Total: Rp${transaction.grand_total}`)
//             .text(`Metode: ${transaction.payment_method}`)
//             .text('======================')
//             .cut()
//             .close();
//     });
// };

// Contoh pemanggilan setelah transaksi sukses
// const transaction = {
//     id: 12345,
//     grand_total: 150000,
//     payment_method: 'Cash'
// };
