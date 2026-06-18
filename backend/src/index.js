const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const pool = require('./models/db');

// Import all routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const slotRoutes = require('./routes/slots');
const appointmentRoutes = require('./routes/appointments');
const patientRoutes = require('./routes/patients');
const chatRoutes = require('./routes/chat');
const whatsappRoutes = require('./routes/whatsapp');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/doctors', doctorRoutes);
app.use('/slots', slotRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/patients', patientRoutes);
app.use('/chat', chatRoutes);
app.use('/whatsapp', whatsappRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok',
      message: 'Clinic AI backend is running',
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`Clinic AI server running on port ${PORT}`);
});
