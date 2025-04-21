 
const express = require('express');
const { tap } = require('../controllers/tapToEarn');
const router = express.Router();

router.post('/tap', async (req, res) => {
  const ctx = { from: { id: req.body.userId }, reply: (msg) => res.json({ message: msg }) };
  const user = await tap(ctx);
  res.json({ user });
});

module.exports = router;