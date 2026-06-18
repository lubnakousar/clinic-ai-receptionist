const express = require('express');
const router = express.Router();
const { chat } = require('../services/ai');
const { v4: uuidv4 } = require('uuid');

// POST /chat — main AI conversation endpoint
router.post('/', async (req, res) => {
  const { message, session_id, channel } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Use existing session or create new one
  const sessionId = session_id || uuidv4();

  try {
    const result = await chat(sessionId, message, channel || 'website');
    res.json(result);
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// GET /chat/:session_id — get conversation history
router.get('/:session_id', async (req, res) => {
  const pool = require('../models/db');
  try {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE session_id = $1',
      [req.params.session_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
