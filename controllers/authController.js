const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// **Registrasi**
const register = (req, res) => {
    const { nama, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    db.query("SELECT email FROM users WHERE email = ?", [email])
    .then(([results]) => {
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const sql = "INSERT INTO users (nama, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?)";
        return db.query(sql, [nama, email, hashedPassword, role, verificationToken])
        .then(() => {
            const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
            return transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verifikasi Email Anda',
                text: `Klik link ini untuk verifikasi email Anda: ${verificationLink}`
            })
            .then(() => {
                return sendTelegramMessage(`📩 Pendaftaran Baru:\n👤 Nama: ${nama}\n📧 Email: ${email}\n🛠️ Role: ${role}\n🔗 Verifikasi: ${verificationLink}`);
            });
        });
    })
    .then(() => {
        res.json({ status: 'success', message: 'Registrasi berhasil! Periksa email Anda untuk verifikasi.' });
    })
    .catch((error) => {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Gagal mendaftarkan user' });
    });
};

// **Verifikasi Email**
const verifyEmail = (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const sql = "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE email = ?";
        db.query(sql, [decoded.email])
        .then(([results]) => {
            if (results.affectedRows === 0) {
                return res.status(400).json({ error: 'Gagal memverifikasi email' });
            }
            return sendTelegramMessage(`✅ Email berhasil diverifikasi untuk: ${decoded.email}`);
        })
        .then(() => {
            res.json({ status: 'success', message: 'Email berhasil diverifikasi' });
        })
        .catch((error) => {
            console.error('Error verifying email:', error);
            res.status(500).json({ error: 'Gagal memverifikasi email' });
        });
    } catch (err) {
        return res.status(400).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
    }
};

// **Login**
const login = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email])
    .then(([results]) => {
        if (results.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        const user = results[0];
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Email belum diverifikasi' });
        }

        return bcrypt.compare(password, user.password)
        .then((passwordMatch) => {
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Email atau password salah' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

            // 🔹 Query validasi user sebelum mengirim response
            return db.query("SELECT id FROM users WHERE id = ?", [user.id])
            .then(([userResult]) => {
                if (userResult.length === 0) {
                    return res.status(400).json({ error: 'User ID tidak valid' });
                }

                // ✅ Kirim response setelah semua validasi selesai
                res.json({ message: 'Login berhasil', token });
            });
        });
    })
    .catch((error) => {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Gagal melakukan login' });
    });
};

// **Fungsi Kirim Pesan ke Telegram**
const sendTelegramMessage = (message) => {
    return axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message
    })
    .catch((error) => {
        console.error('Error sending Telegram message:', error);
    });
};

module.exports = { register, verifyEmail, login };
