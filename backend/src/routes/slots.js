const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

// GET /api/slots?doctor_id=1&date=2024-01-15 — get available slots
router.get('/', async (req, res) => {
  const { doctor_id, date } = req.query;

  try {
    let query = `
      SELECT ts.*, d.name as doctor_name, d.specialty
      FROM time_slots ts
      JOIN doctors d ON ts.doctor_id = d.id
      WHERE ts.is_booked = false
    `;
    const params = [];

    if (doctor_id) {
      params.push(doctor_id);
      query += ` AND ts.doctor_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND ts.slot_date = $${params.length}`;
    }

    // Only show future slots
    query += ` AND ts.slot_date >= CURRENT_DATE`;
    query += ` ORDER BY ts.slot_date, ts.start_time`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/slots — add a single slot (admin only)
router.post('/', auth, async (req, res) => {
  const { doctor_id, slot_date, start_time, end_time } = req.body;

  if (!doctor_id || !slot_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [doctor_id, slot_date, start_time, end_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/slots/bulk — add many slots at once (admin only)
router.post('/bulk', auth, async (req, res) => {
  const { doctor_id, dates, start_time, end_time } = req.body;

  if (!doctor_id || !dates || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const inserted = [];
    for (const date of dates) {
      const result = await pool.query(
        `INSERT INTO time_slots (doctor_id, slot_date, start_time, end_time)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [doctor_id, date, start_time, end_time]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json({ 
      message: `${inserted.length} slots created`,
      slots: inserted 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/slots/:id — delete a slot (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM time_slots WHERE id = $1', [req.params.id]);
    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
