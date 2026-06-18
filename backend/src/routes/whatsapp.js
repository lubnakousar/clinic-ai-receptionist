const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { chat } = require('../services/ai');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// GET /whatsapp/webhook — verification
router.get('/webhook', (req, res) => {
  res.status(200).send('Webhook is active');
});

// POST /whatsapp/webhook — receive messages from Twilio
router.post('/webhook', async (req, res) => {
  const { Body, From } = req.body;

  const sessionId = `whatsapp_${From.replace('whatsapp:', '').replace('+', '')}`;

  console.log(`WhatsApp from ${From}: ${Body}`);

  try {
    const result = await chat(sessionId, Body, 'whatsapp');

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: From,
      body: result.reply
    });

    if (result.booking?.success) {
      await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: From,
        body: `✅ Appointment Confirmed!\n\n📋 ID: #${result.booking.appointment_id}\n👤 Patient: ${result.booking.patient_name}\n📅 Date: ${new Date(result.booking.slot_date).toDateString()}\n⏰ Time: ${result.booking.start_time}\n\nWe look forward to seeing you! 🏥`
      });
    }

    res.status(200).send('');

  } catch (err) {
    console.error('WhatsApp error:', err.message);
    res.status(200).send('');
  }
});

module.exports = router;
