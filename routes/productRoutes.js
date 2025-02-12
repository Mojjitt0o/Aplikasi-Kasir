// routes/productRoutes.js
const express = require('express');
const { addProduct, getProducts, getProductById, updateProduct, deleteProduct, updateStock } = require('../controllers/productController');
const router = express.Router();

router.post('/add', addProduct);  // Tambah produk
router.get('/', getProducts);      // Lihat semua produk
router.get('/:id', getProductById); // Lihat detail produk
router.put('/update/:id', updateProduct); // Update produk
router.delete('/delete/:id', deleteProduct); // Hapus produk
router.put('/update-stock/:id', updateStock); // Tambah/Kurangi stok

module.exports = router;