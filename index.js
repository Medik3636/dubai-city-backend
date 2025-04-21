const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Statik fayllarni qaytarish uchun

// Bot tokenini BotFather’dan olingan token bilan almashtiring
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const PORT = process.env.PORT || 3004;

// MongoDB ulanishi
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/dubai-city', {
  useNewUrlParser: true,
  // useUnifiedTopology: true o‘chirilgan
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

app.get('/', (req, res) => res.send('Bot ishlayapti!'));

// /api/tap endpoint
app.post('/api/tap', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    let user = await User.findOne({ userId });

    if (!user) {
      user = new User({ userId });
      await user.save();
    }

    if (user.energy <= 0) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    user.dubaiCoin += 1;
    user.energy -= 1;
    if (user.dubaiCoin >= user.level * 100) {
      user.level += 1;
      user.maxEnergy += 100;
      user.energy = user.maxEnergy;
    }

    await user.save();
    res.json({ user });
  } catch (error) {
    console.error('Error in /api/tap:', error);
    res.status(500).json({ error: 'Server error' });
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