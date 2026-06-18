const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../models/db');
require('dotenv').config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helper: get available doctors from DB ───────────────────────────────────
async function getAvailableDoctors() {
  const result = await pool.query(
    'SELECT id, name, specialty FROM doctors WHERE is_active = true ORDER BY name'
  );
  return result.rows;
}

// ─── Helper: get available slots ─────────────────────────────────────────────
async function getAvailableSlots(doctorId = null) {
  let query = `
    SELECT 
      ts.id, ts.slot_date, ts.start_time, ts.end_time,
      d.name as doctor_name, d.specialty
    FROM time_slots ts
    JOIN doctors d ON ts.doctor_id = d.id
    WHERE ts.is_booked = false 
    AND ts.slot_date >= CURRENT_DATE
  `;
  const params = [];

  if (doctorId) {
    params.push(doctorId);
    query += ` AND ts.doctor_id = $1`;
  }

  query += ` ORDER BY ts.slot_date, ts.start_time LIMIT 10`;

  const result = await pool.query(query, params);
  return result.rows;
}

// ─── Helper: save patient and book appointment ────────────────────────────────
async function bookAppointment(patientData, slotId, channel) {
  const { name, phone, email, address, medical_info, doctor_id } = patientData;

  // Check slot is still available
  const slotCheck = await pool.query(
    'SELECT * FROM time_slots WHERE id = $1 AND is_booked = false',
    [slotId]
  );

  if (slotCheck.rows.length === 0) {
    return { success: false, message: 'Sorry, that slot was just taken. Please choose another.' };
  }

  const slot = slotCheck.rows[0];

  // Find or create patient
  let patient;
  const existingPatient = await pool.query(
    'SELECT * FROM patients WHERE phone = $1',
    [phone]
  );

  if (existingPatient.rows.length > 0) {
    // Update existing patient info
    const updated = await pool.query(
      `UPDATE patients SET name=$1, email=$2, address=$3, medical_info=$4 
       WHERE phone=$5 RETURNING *`,
      [name, email, address, medical_info, phone]
    );
    patient = updated.rows[0];
  } else {
    // Create new patient
    const newPatient = await pool.query(
      `INSERT INTO patients (name, phone, email, address, medical_info)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, phone, email, address, medical_info]
    );
    patient = newPatient.rows[0];
  }

  // Create appointment
  const appointment = await pool.query(
    `INSERT INTO appointments (patient_id, doctor_id, time_slot_id, channel)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [patient.id, slot.doctor_id, slotId, channel]
  );

  // Mark slot as booked
  await pool.query(
    'UPDATE time_slots SET is_booked = true WHERE id = $1',
    [slotId]
  );

  return {
    success: true,
    appointment_id: appointment.rows[0].id,
    patient_name: name,
    slot_date: slot.slot_date,
    start_time: slot.start_time,
    end_time: slot.end_time
  };
}

// ─── Build system prompt ──────────────────────────────────────────────────────
async function buildSystemPrompt() {
  const doctors = await getAvailableDoctors();
  const slots = await getAvailableSlots();

  const doctorList = doctors.length > 0
    ? doctors.map(d => `- Dr. ${d.name} (${d.specialty}) [ID: ${d.id}]`).join('\n')
    : 'No doctors available at the moment.';

  const slotList = slots.length > 0
    ? slots.map(s =>
        `- Slot ID ${s.id}: Dr. ${s.doctor_name} on ${s.slot_date} from ${s.start_time} to ${s.end_time}`
      ).join('\n')
    : 'No slots available at the moment.';

  return `You are Sara, a friendly and professional AI receptionist for a medical clinic.
Your job is to help patients book appointments in a warm, conversational way.

AVAILABLE DOCTORS:
${doctorList}

AVAILABLE TIME SLOTS:
${slotList}

YOUR GOAL:
Collect the following information from the patient step by step:
1. Full name
2. Phone number
3. Email address (optional)
4. Home address
5. Reason for visit / medical concern
6. Preferred doctor or specialty
7. Preferred date/time

RULES:
- Be warm, polite and professional at all times
- Ask one or two questions at a time — never overwhelm the patient
- If no slots match their preference, suggest the closest available option
- Once you have all info, summarize and confirm before booking
- When ready to book, output EXACTLY this JSON on its own line:
  BOOK_APPOINTMENT:{"name":"...","phone":"...","email":"...","address":"...","medical_info":"...","doctor_id":0,"slot_id":0}
- After booking confirm with the appointment ID and details
- If patient asks anything medical, say you will note it and the doctor will address it
- Never give medical advice`;
}

// ─── Main chat function ───────────────────────────────────────────────────────
async function chat(sessionId, userMessage, channel = 'website') {
  // Load or create conversation
  let conversation = await pool.query(
    'SELECT * FROM conversations WHERE session_id = $1',
    [sessionId]
  );

  let messages = [];
  let patientId = null;

  if (conversation.rows.length > 0) {
    messages = conversation.rows[0].messages;
    patientId = conversation.rows[0].patient_id;
  }

  // Add user message to history
  messages.push({ role: 'user', content: userMessage });

  // Build system prompt with live DB data
  const systemPrompt = await buildSystemPrompt();

  // Call Claude
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages
  });

  const assistantMessage = response.content[0].text;

  // Add assistant reply to history
  messages.push({ role: 'assistant', content: assistantMessage });

  // Check if AI wants to book an appointment
  let bookingResult = null;
  const bookingMatch = assistantMessage.match(/BOOK_APPOINTMENT:(\{.*\})/);

  if (bookingMatch) {
    try {
      const bookingData = JSON.parse(bookingMatch[1]);
      bookingResult = await bookAppointment(bookingData, bookingData.slot_id, channel);

      if (bookingResult.success) {
        // Add confirmation to messages
        const confirmMsg = `Appointment booked! ID: #${bookingResult.appointment_id}`;
        messages.push({ role: 'assistant', content: confirmMsg });
      }
    } catch (err) {
      console.error('Booking error:', err.message);
    }
  }

  // Save conversation to DB
  if (conversation.rows.length > 0) {
    await pool.query(
      `UPDATE conversations 
       SET messages = $1, updated_at = NOW()
       WHERE session_id = $2`,
      [JSON.stringify(messages), sessionId]
    );
  } else {
    await pool.query(
      `INSERT INTO conversations (session_id, channel, messages)
       VALUES ($1, $2, $3)`,
      [sessionId, channel, JSON.stringify(messages)]
    );
  }

  // Return clean reply (strip the BOOK_APPOINTMENT line from display)
  const cleanReply = assistantMessage.replace(/BOOK_APPOINTMENT:\{.*\}/, '').trim();

  return {
    reply: cleanReply,
    booking: bookingResult,
    session_id: sessionId
  };
}

module.exports = { chat };
