const express = require('express');
const { createTransaction, getTransactions, getTransactionDetails, cancelTransaction, getDailyReport, getTopSellingProducts } = require('../controllers/transactionController');

const router = express.Router();

router.post('/create', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionDetails);
router.post('/cancel', cancelTransaction);

// Laporan
router.get('/report/daily', getDailyReport);
router.get('/report/top-selling', getTopSellingProducts);

module.exports = router;
