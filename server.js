const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { verifyToken } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 🔹 Set folder public untuk file static (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// 🔹 Set folder publicdashboard untuk file static Dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'publicdashboard')));

// 🔹 Set folder publicdashboard untuk file static Dashboard
app.use('/reset', express.static(path.join(__dirname, 'publicaturpassword')));




// 🔹 Set folder publicdashboard untuk file static Dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'publicdashboard')));

// 🔹 Arahkan ke index.html saat akses root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔹 Arahkan ke index.html saat akses root URL
app.get('/reset', (req, res) => {
    res.sendFile(path.join(__dirname, 'publicaturpassword', 'index.html'));
});




// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', verifyToken, transactionRoutes);
app.use('/api/products', verifyToken, productRoutes);
app.use('/api/reports', verifyToken, reportRoutes);

db.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
