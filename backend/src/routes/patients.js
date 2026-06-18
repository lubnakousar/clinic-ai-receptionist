const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

// GET /api/patients — all patients (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/patients/:id — single patient with appointments
router.get('/:id', auth, async (req, res) => {
  try {
    const patient = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [req.params.id]
    );
    if (patient.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const appointments = await pool.query(`
      SELECT a.*, d.name as doctor_name, ts.slot_date, ts.start_time
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      WHERE a.patient_id = $1
      ORDER BY ts.slot_date DESC
    `, [req.params.id]);

    res.json({
      ...patient.rows[0],
      appointments: appointments.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
