# 🏥 Clinic AI Receptionist

A full-stack AI-powered clinic receptionist system that handles appointment booking via website chat and WhatsApp — built with Node.js, React, PostgreSQL, and Claude AI.

## 🌐 Live Demo
- **Dashboard:** https://clinic.lrdevstudio.com
- **Chat Widget Demo:** https://clinic.lrdevstudio.com/demo.html

> Login: `admin@clinic.com` / `Admin@123`

## ✨ Features

- 🤖 **AI Receptionist** — Conversational AI (Claude) that books appointments naturally
- 💬 **Website Chat Widget** — Embeddable chat bubble for any clinic website
- 📱 **WhatsApp Integration** — Patients book via WhatsApp (Twilio)
- 🏥 **Admin Dashboard** — Full React + TypeScript dashboard for clinic staff
- 👨‍⚕️ **Doctor Management** — Add, edit, manage doctors and specialties
- 📅 **Schedule Management** — Create and manage time slots
- 👥 **Patient Records** — Auto-collected patient information
- 📋 **Appointment Tracking** — View, update, and manage all bookings

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **AI** | Anthropic Claude API |
| **WhatsApp** | Twilio WhatsApp API |
| **Auth** | JWT Tokens |
| **Server** | Nginx, PM2, Ubuntu VPS |
| **SSL** | Let's Encrypt |

## 📁 Project Structure
clinic-ai/

├── backend/

│   ├── src/

│   │   ├── routes/          # API endpoints

│   │   ├── services/        # AI engine

│   │   ├── models/          # Database connection

│   │   └── middleware/      # Auth middleware

│   └── package.json

└── frontend/

├── src/

│   ├── pages/           # Dashboard pages

│   ├── components/      # Reusable components

│   ├── api/             # Axios config

│   └── types/           # TypeScript types

└── package.json
## 🚀 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Admin login |
| GET | `/doctors` | List all doctors |
| POST | `/doctors` | Add doctor |
| GET | `/slots` | Get available slots |
| POST | `/slots` | Add time slot |
| GET | `/appointments` | All appointments |
| GET | `/appointments/today` | Today's appointments |
| POST | `/chat` | AI chat endpoint |
| POST | `/whatsapp/webhook` | WhatsApp webhook |

## ⚙️ Setup Guide

### Prerequisites
- Node.js v20+
- PostgreSQL
- Anthropic API key
- Twilio account (for WhatsApp)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/clinic-ai-receptionist.git
cd clinic-ai-receptionist

# Backend setup
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm start

# Frontend setup
cd ../frontend
npm install
npm run build
```

### Environment Variables

```env
PORT=3005
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_ai
DB_USER=clinic_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 💡 How the AI Works

1. Patient opens chat widget or sends WhatsApp message
2. Sara (AI) greets and collects: name, phone, address, medical concern
3. AI checks live doctor availability from database
4. Patient selects preferred doctor and time slot
5. AI books appointment and saves patient record
6. Confirmation sent back to patient
7. Appointment appears in admin dashboard instantly

## 📸 Screenshots

> Admin Dashboard, Chat Widget, and WhatsApp integration screenshots

## 🔧 Customization

- **Change AI personality** → Edit system prompt in `backend/src/services/ai.js`
- **Add new doctors** → Use admin dashboard or POST `/doctors`
- **Embed on any website** → Add one line: `<script src="https://clinic.lrdevstudio.com/widget.js"></script>`

## 📄 License
MIT — Free to use for commercial projects

## 👨‍💻 Built by
**LR Dev Studio** — [lrdevstudio.com](https://lrdevstudio.com)
