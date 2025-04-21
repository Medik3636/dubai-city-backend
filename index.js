const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const { tap } = require('./controllers/tapToEarn');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Statik fayllarni qaytarish uchun

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const PORT = process.env.PORT || 3004;

app.get('/', (req, res) => res.send('Bot ishlayapti!'));

app.post('/api/tap', async (req, res) => {
  const { userId } = req.body;
  const ctx = { from: { id: userId }, reply: (msg) => console.log(msg) };
  await tap(ctx);
  const users = JSON.parse(require('fs').readFileSync('./data/users.json'));
  res.json({ user: users.users[userId] });
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Dubai City Botga xush kelibsiz!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'O‘yinni boshlash', web_app: { url: `https://dubai-city-backend.onrender.com

` } }],
      ],
    },
  });
});

app.listen(PORT, () => console.log(`Server http://localhost:${PORT} da ishlamoqda`));
console.log('Bot ishga tushdi');