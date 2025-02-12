const express = require('express');
const { createTransaction, getTransactions, getTransactionDetails, cancelTransaction, getDailyReport, getTopSellingProducts } = require('../controllers/transactionController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create', verifyToken, checkRole(['kasir', 'admin']), createTransaction);
router.get('/', verifyToken, checkRole(['kasir', 'admin']), getTransactions);
router.get('/:id', verifyToken, checkRole(['kasir', 'admin']), getTransactionDetails);
router.post('/cancel', verifyToken, checkRole(['admin']), cancelTransaction);

module.exports = router;
