// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
console.log(reportController);

// Laporan Harian, Mingguan, Bulanan
router.get('/daily', reportController.getDailyReport);
router.get('/weekly', reportController.getWeeklyReport);
router.get('/monthly', reportController.getMonthlyReport);

// Produk Terlaris
router.get('/top-products', reportController.getTopSellingProducts);

// Rekap Kasir
router.get('/cashier-report', reportController.getCashierReport);

// Export Laporan Penjualan ke Excel
router.get('/export-sales-report', reportController.exportSalesReportToExcel);

module.exports = router;
