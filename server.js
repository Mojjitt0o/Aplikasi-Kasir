const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, URL: ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/products', productRoutes)
app.use('/api/reports', reportRoutes); // Tambahkan route laporan


// Cek koneksi database
// Cek koneksi database
db.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release(); // Lepaskan koneksi setelah pengecekan
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });


// Routing awal
app.get('/', (req, res) => {
    res.send('API Kasir Berjalan...');
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
