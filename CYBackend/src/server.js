require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

const app = express();

// Support secure cookies behind proxies like Render or Vercel
app.set('trust proxy', 1);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// اتصال قاعدة البيانات
connectDB();

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// المسارات (تأكد إن الملفات دي موجودة بالأسماء دي)
app.use('/api/puzzles', require('./routes/puzzleRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // السطر ده ناقص عندك!
app.use('/api/ctf', require('./routes/ctfRoutes')); // CTF routes


// Error Handler بسيط عشان السيرفر ما يقعش لو حصل غلط
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});