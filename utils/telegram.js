// utils/telegram.js
const axios = require('axios');

const sendTelegramMessage = (message) => {
    const telegramBotToken = (`${process.env.TELEGRAM_BOT_TOKEN}`); // Ganti dengan token bot Telegram milikmu
    const chatId = (`${process.env.TELEGRAM_CHAT_ID}`); // Ganti dengan chat ID tujuan
    
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    return axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
    })
    .then((response) => {
        console.log('Notifikasi Telegram terkirim:', response.data);
    })
    .catch((error) => {
        console.error('Error mengirim notifikasi Telegram:', error);
    });
};

module.exports = { sendTelegramMessage };
