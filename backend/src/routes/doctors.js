const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const auth = require('../middleware/auth');

// GET /api/doctors — get all doctors (public, AI uses this)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM doctors WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/doctors/:id — get single doctor
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM doctors WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/doctors — add new doctor (admin only)
router.post('/', auth, async (req, res) => {
  const { name, specialty, phone, email, bio } = req.body;

  if (!name || !specialty) {
    return res.status(400).json({ error: 'Name and specialty are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctors (name, specialty, phone, email, bio)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, specialty, phone, email, bio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/doctors/:id — update doctor (admin only)
router.put('/:id', auth, async (req, res) => {
  const { name, specialty, phone, email, bio, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE doctors 
       SET name=$1, specialty=$2, phone=$3, email=$4, bio=$5, is_active=$6
       WHERE id=$7 RETURNING *`,
      [name, specialty, phone, email, bio, is_active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/doctors/:id — delete doctor (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
