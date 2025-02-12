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
                html: `
                    <p>Terima kasih telah mendaftar. Klik link di bawah ini untuk verifikasi email Anda:</p>
                    <a href="${verificationLink}">Silahkan Verifikasi</a>
                `
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

// **Lupa Password - Kirim Token Reset**
const forgotPassword = (req, res) => {
    const { email } = req.body;
    
    db.query("SELECT id FROM users WHERE email = ?", [email])
    .then(([results]) => {
        if (results.length === 0) {
            return res.status(404).json({ error: 'Email tidak ditemukan' });
        }
        
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        return db.query("UPDATE users SET reset_token = ? WHERE email = ?", [resetToken, email])
        .then(() => {
            const resetLink = `${process.env.BASE_URL}/reset/?token=${resetToken}`;
            return transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Reset Password',
                html: `<p>Klik link di bawah untuk mereset password Anda:</p>
                       <a href="${resetLink}">Reset Password</a>`
            });
        });
    })
    .then(() => {
        res.json({ status: 'success', message: 'Email reset password telah dikirim' });
    })
    .catch(error => {
        console.error('Error sending reset email:', error);
        res.status(500).json({ error: 'Gagal mengirim email reset password' });
    });
};

// **Reset Password dengan Token**
const resetPassword = (req, res) => {
    const { token, newPassword } = req.body;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        db.query("SELECT email FROM users WHERE reset_token = ?", [token])
        .then(([results]) => {
            if (results.length === 0) {
                return res.status(400).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
            }
            
            return bcrypt.hash(newPassword, 10)
            .then(hashedPassword => {
                return db.query("UPDATE users SET password = ?, reset_token = NULL WHERE email = ?", [hashedPassword, decoded.email]);
            });
        })
        .then(() => {
            res.json({ status: 'success', message: 'Password berhasil direset' });
        })
        .catch(error => {
            console.error('Error resetting password:', error);
            res.status(500).json({ error: 'Gagal mereset password' });
        });
    } catch (err) {
        return res.status(400).json({ error: 'Token tidak valid atau sudah kadaluarsa' });
    }
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

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };
