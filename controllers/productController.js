// controllers/productController.js
const db = require('../config/db');

// **Tambah Produk**
const addProduct = (req, res) => {
    const { nama, harga, stok, barcode } = req.body;
    db.query("INSERT INTO produk (nama, harga, stok, barcode) VALUES (?, ?, ?, ?)", 
        [nama, harga, stok, barcode]
    )
    .then(([result]) => {
        res.json({ message: 'Produk berhasil ditambahkan', productId: result.insertId });
    })
    .catch((err) => {
        console.error('Error adding product:', err);
        res.status(500).json({ error: 'Gagal menambah produk' });
    });
};

// **Lihat Semua Produk**
const getProducts = (req, res) => {
    db.query("SELECT * FROM produk ORDER BY nama ASC")
    .then(([results]) => {
        res.json(results);
    })
    .catch((err) => {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Gagal mengambil data produk' });
    });
};

// **Lihat Detail Produk**
const getProductById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM produk WHERE id = ?", [id])
    .then(([result]) => {
        if (result.length === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
        res.json(result[0]);
    })
    .catch((err) => {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ error: 'Gagal mengambil detail produk' });
    });
};

// **Update Produk**
const updateProduct = (req, res) => {
    const { id } = req.params;
    const { nama, harga, stok, barcode } = req.body;
    db.query("UPDATE produk SET nama = ?, harga = ?, stok = ?, barcode = ? WHERE id = ?", 
        [nama, harga, stok, barcode, id]
    )
    .then(([result]) => {
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
        res.json({ message: 'Produk berhasil diperbarui' });
    })
    .catch((err) => {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Gagal memperbarui produk' });
    });
};

// **Hapus Produk**
const deleteProduct = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM produk WHERE id = ?", [id])
    .then(([result]) => {
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
        res.json({ message: 'Produk berhasil dihapus' });
    })
    .catch((err) => {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Gagal menghapus produk' });
    });
};

// **Tambah/Kurangi Stok**
const updateStock = (req, res) => {
    const { id } = req.params;
    const { stok } = req.body;
    db.query("UPDATE produk SET stok = stok + ? WHERE id = ?", [stok, id])
    .then(([result]) => {
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }
        res.json({ message: 'Stok berhasil diperbarui' });
    })
    .catch((err) => {
        console.error('Error updating stock:', err);
        res.status(500).json({ error: 'Gagal memperbarui stok' });
    });
};

module.exports = { addProduct, getProducts, getProductById, updateProduct, deleteProduct, updateStock };
