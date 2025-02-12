const db = require('../config/db');
const XLSX = require('xlsx');

// Laporan Harian
exports.getDailyReport = (req, res) => {
    db.query(`
        SELECT SUM(grand_total) AS omset, SUM(pajak) AS pajak
        FROM transactions
        WHERE DATE(transaction_date) = CURDATE();
    `)
    .then(([result]) => {
        res.json(result);
    })
    .catch((error) => {
        console.error("Error fetching daily report:", error);
        res.status(500).json({ message: "Error fetching daily report", error });
    });
};

// Laporan Mingguan
exports.getWeeklyReport = (req, res) => {
    db.query(`
        SELECT WEEK(transaction_date) AS minggu, SUM(grand_total) AS omset, SUM(pajak) AS pajak
        FROM transactions
        WHERE YEAR(transaction_date) = YEAR(CURDATE())
        GROUP BY minggu;
    `)
    .then(([result]) => {
        res.json(result);
    })
    .catch((error) => {
        console.error("Error fetching weekly report:", error);
        res.status(500).json({ message: "Error fetching weekly report", error });
    });
};

// Laporan Bulanan
exports.getMonthlyReport = (req, res) => {
    db.query(`
        SELECT MONTH(transaction_date) AS bulan, SUM(grand_total) AS omset, SUM(pajak) AS pajak
        FROM transactions
        WHERE YEAR(transaction_date) = YEAR(CURDATE())
        GROUP BY bulan;
    `)
    .then(([result]) => {
        res.json(result);
    })
    .catch((error) => {
        console.error("Error fetching monthly report:", error);
        res.status(500).json({ message: "Error fetching monthly report", error });
    });
};

// Produk Terlaris
exports.getTopSellingProducts = (req, res) => {
    db.query(`
        SELECT p.id AS produk_id, p.nama AS nama_produk, SUM(dt.jumlah) AS jumlah_penjualan, SUM(dt.total_harga) AS total_penjualan
        FROM detail_transaksi dt
        JOIN produk p ON p.id = dt.produk_id
        GROUP BY dt.produk_id
        ORDER BY jumlah_penjualan DESC
        LIMIT 10;
    `)
    .then(([result]) => {
        res.json(result);
    })
    .catch((error) => {
        console.error("Error fetching top selling products:", error);
        res.status(500).json({ message: "Error fetching top selling products", error });
    });
};

// Rekap Penjualan per Kasir
exports.getCashierReport = (req, res) => {
    db.query(`
        SELECT u.id AS kasir_id, u.nama AS nama_kasir, COUNT(t.id) AS jumlah_transaksi, SUM(t.grand_total) AS total_omset
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        WHERE u.role = 'kasir'
        GROUP BY u.id
        ORDER BY jumlah_transaksi DESC;
    `)
    .then(([result]) => {
        res.json(result);
    })
    .catch((error) => {
        console.error("Error fetching cashier report:", error);
        res.status(500).json({ message: "Error fetching cashier report", error });
    });
};

// Export Laporan Penjualan ke Excel
exports.exportSalesReportToExcel = (req, res) => {
    db.query('SELECT * FROM laporan_penjualan')
    .then(([result]) => {
        const ws = XLSX.utils.json_to_sheet(result);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');

        const filePath = './laporan_penjualan.xlsx';
        XLSX.writeFile(wb, filePath);

        res.download(filePath);
    })
    .catch((error) => {
        console.error("Error exporting sales report:", error);
        res.status(500).json({ message: "Error exporting sales report to Excel", error });
    });
};
