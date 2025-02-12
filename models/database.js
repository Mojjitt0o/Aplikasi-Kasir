const db = require('../config/db');

// Membuat tabel Users (Akun)
const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'kasir', 'supervisor') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255)
);
`;

// Membuat tabel Produk
const createProductTable = `
CREATE TABLE IF NOT EXISTS produk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(100) UNIQUE,
    nama VARCHAR(255) NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    stok INT NOT NULL,
    stok_minimum INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Membuat tabel Transaksi (transactions)
const createTransactionTable = `
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ganti 'tanggal' menjadi 'transaction_date'
    total DECIMAL(10,2) NOT NULL,
    pajak DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    metode_pembayaran ENUM('cash', 'qris', 'ewallet', 'transfer') NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Membuat tabel Detail Transaksi
const createTransactionDetailTable = `
CREATE TABLE IF NOT EXISTS detail_transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaksi_id INT NOT NULL,
    produk_id INT NOT NULL,
    jumlah INT NOT NULL,
    harga DECIMAL(10,2) NOT NULL,
    total_harga DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (transaksi_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);
`;

// Membuat tabel Laporan Penjualan
const createSalesReportTable = `
CREATE TABLE IF NOT EXISTS laporan_penjualan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    periode ENUM('harian', 'mingguan', 'bulanan') NOT NULL,
    tanggal DATE NOT NULL,
    omset DECIMAL(10,2) NOT NULL,
    pajak DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL
);
`;

// Membuat tabel Laporan Produk Terlaris
const createTopProductReportTable = `
CREATE TABLE IF NOT EXISTS laporan_produk_terlaris (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    nama_produk VARCHAR(255) NOT NULL,
    jumlah_penjualan INT NOT NULL,
    total_penjualan DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (produk_id) REFERENCES produk(id)
);
`;

// Membuat tabel Laporan Kasir
const createCashierReportTable = `
CREATE TABLE IF NOT EXISTS laporan_kasir (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kasir_id INT NOT NULL,
    nama_kasir VARCHAR(255) NOT NULL,
    jumlah_transaksi INT NOT NULL,
    total_omset DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (kasir_id) REFERENCES users(id)
);
`;

// Membuat tabel Laporan Export
const createExportReportTable = `
CREATE TABLE IF NOT EXISTS laporan_export (
    id INT AUTO_INCREMENT PRIMARY KEY,
    laporan_jenis ENUM('penjualan', 'produk_terlaris', 'kasir') NOT NULL,
    export_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Menjalankan Query Pembuatan Tabel
db.query(createUserTable).then(() => console.log('Tabel `users` siap')).catch(err => console.error('Error membuat tabel users:', err));
db.query(createProductTable).then(() => console.log('Tabel `produk` siap')).catch(err => console.error('Error membuat tabel produk:', err));
db.query(createTransactionTable).then(() => console.log('Tabel `transactions` siap')).catch(err => console.error('Error membuat tabel transactions:', err));
db.query(createTransactionDetailTable).then(() => console.log('Tabel `detail_transaksi` siap')).catch(err => console.error('Error membuat tabel detail_transaksi:', err));
db.query(createSalesReportTable).then(() => console.log('Tabel `laporan_penjualan` siap')).catch(err => console.error('Error membuat tabel laporan_penjualan:', err));
db.query(createTopProductReportTable).then(() => console.log('Tabel `laporan_produk_terlaris` siap')).catch(err => console.error('Error membuat tabel laporan_produk_terlaris:', err));
db.query(createCashierReportTable).then(() => console.log('Tabel `laporan_kasir` siap')).catch(err => console.error('Error membuat tabel laporan_kasir:', err));
db.query(createExportReportTable).then(() => console.log('Tabel `laporan_export` siap')).catch(err => console.error('Error membuat tabel laporan_export:', err));

module.exports = db;
