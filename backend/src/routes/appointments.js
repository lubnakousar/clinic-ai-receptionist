const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

// GET /api/appointments — get all appointments (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.status,
        a.channel,
        a.notes,
        a.created_at,
        p.name as patient_name,
        p.phone as patient_phone,
        p.email as patient_email,
        p.address as patient_address,
        p.medical_info,
        d.name as doctor_name,
        d.specialty,
        ts.slot_date,
        ts.start_time,
        ts.end_time
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      ORDER BY ts.slot_date DESC, ts.start_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/today — today's appointments (admin only)
router.get('/today', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.status,
        a.channel,
        p.name as patient_name,
        p.phone as patient_phone,
        p.medical_info,
        d.name as doctor_name,
        d.specialty,
        ts.start_time,
        ts.end_time
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      WHERE ts.slot_date = CURRENT_DATE
      ORDER BY ts.start_time
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/appointments/:id/status — update status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'cancelled', 'completed', 'no-show'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
