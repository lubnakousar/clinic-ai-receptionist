const express = require('express');
const router = express.Router();
require('dotenv').config();

// POST /demo/verify — check demo password
router.post('/verify', (req, res) => {
  const { password } = req.body;

  if (password === process.env.DEMO_PASSWORD) {
    res.json({ success: true, token: Buffer.from(`demo:${Date.now()}`).toString('base64') });
  } else {
    res.status(401).json({ success: false, error: 'Invalid demo password' });
  }
});

module.exports = router;
