const express = require('express');
const { addProduct, getProducts, getProductById, updateProduct, deleteProduct, updateStock } = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', verifyToken, checkRole(['admin']), addProduct);  
router.get('/', verifyToken, checkRole(['kasir', 'admin']), getProducts);
router.get('/:id', verifyToken, checkRole(['kasir', 'admin']), getProductById);
router.put('/update/:id', verifyToken, checkRole(['admin']), updateProduct);
router.delete('/delete/:id', verifyToken, checkRole(['admin']), deleteProduct);
router.put('/update-stock/:id', verifyToken, checkRole(['admin']), updateStock);

module.exports = router;
