const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://dubai-city-frontend.onrender.com' }));
app.use(express.json());
app.use(express.static('public')); // Statik fayllarni qaytarish uchun

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const PORT = process.env.PORT || 3004;

// MongoDB ulanishi
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User modeli
const userSchema = new mongoose.Schema({
  userId: String,
  dubaiCoin: { type: Number, default: 0 },
  energy: { type: Number, default: 1000 },
  maxEnergy: { type: Number, default: 1000 },
  level: { type: Number, default: 1 },
});
const User = mongoose.model('User', userSchema);

// Asosiy sahifa
app.get('/', (req, res) => res.send('Bot ishlayapti!'));

// /api/tap endpoint
app.post('/api/tap', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.error('userId is missing in /api/tap request');
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    let user = await User.findOne({ userId });

    if (!user) {
      console.log(`Creating new user with userId: ${userId}`);
      user = new User({ userId });
      await user.save();
    }

    if (user.energy <= 0) {
      console.log(`User ${userId} has no energy`);
      return res.status(400).json({ error: 'Not enough energy' });
    }

    user.dubaiCoin += user.level;
    user.energy -= 1;
    if (user.dubaiCoin >= user.level * 100) {
      user.level += 1;
      user.maxEnergy += 100;
      user.energy = user.maxEnergy;
      console.log(`User ${userId} leveled up to ${user.level}`);
    }

    await user.save();
    console.log(`User ${userId} updated:`, user);
    res.json({ user });
  } catch (error) {
    console.error('Error in /api/tap:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
  if (error.message.includes('409')) {
    console.error('Conflict error detected. Stopping bot...');
    bot.stopPolling();
  } else {
    bot.stopPolling().then(() => {
      console.log('Polling stopped. Restarting after 5 seconds...');
      setTimeout(() => {
        bot.startPolling();
      }, 5000);
    });
  }
});

// /start buyrug‘i uchun handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Dubai City Botga xush kelibsiz!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "O‘yinni boshlash",
            web_app: { url: 'https://dubai-city-frontend.onrender.com' },
          },
        ],
      ],
    },
  });
});

// Bot ishga tushdi xabari
console.log('Bot successfully started');

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishlamoqda`);
});