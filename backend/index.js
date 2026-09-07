import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRoutes from './routes/analyze.js';
import companyRoutes from './routes/company.js';
import complaintRoutes from './routes/complaint.js';
import historyRoutes from './routes/history.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import { verifyToken, requireAdmin, optionalAuth } from './middleware/auth.js';
import { connectDB } from './config/db.js';

dotenv.config();

// Initialize Database Connection
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", 
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'AI Cyber Trust Shield API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', optionalAuth, analyzeRoutes);
app.use('/api/company-check', optionalAuth, companyRoutes);
app.use('/api/complaint', optionalAuth, complaintRoutes);
app.use('/api/history', optionalAuth, historyRoutes);
app.use('/api/admin', verifyToken, requireAdmin, adminRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🛡️  AI Cyber Trust Shield API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
