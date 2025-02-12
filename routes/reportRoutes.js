const express = require('express');
const reportController = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Laporan Harian, Mingguan, Bulanan
router.get('/daily', verifyToken, checkRole(['kasir', 'admin']), reportController.getDailyReport);
router.get('/weekly', verifyToken, checkRole(['kasir', 'admin']), reportController.getWeeklyReport);
router.get('/monthly', verifyToken, checkRole(['kasir', 'admin']), reportController.getMonthlyReport);

// Produk Terlaris & Rekap Kasir (Hanya untuk Admin)
router.get('/top-products', verifyToken, checkRole(['kasir', 'admin']), reportController.getTopSellingProducts);
router.get('/cashier-report', verifyToken, checkRole(['admin']), reportController.getCashierReport);
router.get('/export-sales-report', verifyToken, checkRole(['admin']), reportController.exportSalesReportToExcel);

module.exports = router;
