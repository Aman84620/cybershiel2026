# AI Cyber Trust Shield 🛡️

A production-level AI-powered cybersecurity platform that helps users detect fake job and internship scams.

![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Gemini-blue)

---

## 🎯 Features

- **Multi-Mode Input**: Paste text, upload screenshots, or submit PDF offer letters
- **AI Scam Detection**: Google Gemini-powered analysis with fraud scoring
- **Company Verification**: WHOIS domain validation for company authenticity
- **OCR Processing**: Automatic text extraction from images and PDFs
- **Trust Report**: Animated fraud score gauge, red flags, AI explanation
- **Smart Complaints**: Auto-filled complaint forms with email notifications
- **Scan History**: MongoDB-backed persistent history of past analyses
- **User Authentication**: Secure Sign In and Sign Up with encrypted passwords
- **Administrator Portal**: Single-admin access control for Command Center analytics
- **Premium UI**: Cybersecurity-themed dark mode with Matrix background, glassmorphism, and neon effects

---

## 🏗️ Architecture

```
/frontend     → Vite + React (UI & client logic)
/backend      → Node.js + Express + MongoDB (API, AI, Auth, OCR, DB)
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
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cybershield?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=your_admin_email_here
ADMIN_PASSWORD=your_admin_password_here
GEMINI_API_KEY=your_gemini_api_key
WHOIS_API_KEY=your_whois_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
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

## 🔑 Database & API Setup

| Service | Purpose | Details |
|---------|---------|---------|
| MongoDB Atlas | Database | Set `MONGO_URI` in `backend/.env` |
| Google Gemini | AI Analysis | [aistudio.google.com](https://aistudio.google.com) |
| WhoisXML API | Company Check | [whoisxmlapi.com](https://whoisxmlapi.com) |
| Email (Gmail) | Complaint Alerts | SMTP / Google App Passwords |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | User or Administrator Sign In |
| GET | `/api/auth/me` | Validate session token |
| POST | `/api/analyze` | Analyze content for scams |
| POST | `/api/company-check` | Verify company authenticity |
| POST | `/api/complaint` | File a fraud complaint |
| GET | `/api/history` | Get scan history |
| GET | `/api/admin/stats` | Admin dashboard analytics |

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
- **Backend**: Node.js, Express 5, Multer, Mongoose
- **Database**: MongoDB (Local or MongoDB Atlas Cluster)
- **AI Engine**: Google Gemini 2.0 Flash
- **OCR Engine**: Tesseract.js
- **Security**: JWT Authentication, bcrypt password hashing
- **Email Service**: Nodemailer
- **Domain Check**: WhoisXML API

---

Built with ❤️ for a safer internet.
