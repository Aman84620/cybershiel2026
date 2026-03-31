# AI Cyber Trust Shield 🛡️

A production-level AI-powered cybersecurity platform that helps users detect fake job and internship scams.

![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Gemini-blue)

---

## 🎯 Features

- **Multi-Mode Input**: Paste text, upload screenshots, or submit PDF offer letters
- **AI Scam Detection**: Google Gemini-powered analysis with fraud scoring
- **Company Verification**: WHOIS domain validation for company authenticity
- **OCR Processing**: Automatic text extraction from images and PDFs
- **Trust Report**: Animated fraud score gauge, red flags, AI explanation
- **Smart Complaints**: Auto-filled complaint forms with email notifications
- **Scan History**: Firebase-backed history of past analyses
- **Premium UI**: Cybersecurity-themed dark mode with Matrix background, glassmorphism, and neon effects

---

## 🏗️ Architecture

```
/frontend     → Vite + React (UI & client logic)
/backend      → Node.js + Express (API, AI, OCR, DB)
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
WHOIS_API_KEY=your_whois_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FIREBASE_CONFIG={"type":"service_account",...}
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔑 API Keys Setup

| Service | Get Key From | Required |
|---------|-------------|----------|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | ✅ Core |
| WhoisXML API | [whoisxmlapi.com](https://whoisxmlapi.com) | Optional |
| Firebase | [console.firebase.google.com](https://console.firebase.google.com) | Optional |
| Email (Gmail) | Google App Passwords | Optional |

> **Note**: The system works without API keys using mock/demo data. Add keys for production functionality.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze content for scams |
| POST | `/api/company-check` | Verify company authenticity |
| POST | `/api/complaint` | File a fraud complaint |
| GET | `/api/history` | Get scan history |

---

## 🚢 Deployment

### Frontend → Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_URL` to your backend URL

### Backend → Render
1. Create a new Web Service on Render
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all environment variables from `.env.example`

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express 5, Multer
- **AI**: Google Gemini 2.0 Flash
- **OCR**: Tesseract.js
- **Database**: Firebase Firestore (with in-memory fallback)
- **Email**: Nodemailer
- **Domain Check**: WhoisXML API

---

Built with ❤️ for a safer internet.
