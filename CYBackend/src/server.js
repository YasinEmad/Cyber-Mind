require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const app = express();

// اتصال قاعدة البيانات
connectDB();

// --- حل مشكلة الـ CORS نهائياً ---
app.use(cors({
  origin: 'http://localhost:5173', // بورت الفرونت إند بتاعك
  credentials: true,               // مهم جداً عشان Axios يبعت الكوكيز
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ده سطر زيادة للأمان عشان المتصفحات اللي بتبعت Pre-flight request
app.options('*', cors()); 
// ------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// المسارات (تأكد إن الملفات دي موجودة بالأسماء دي)
app.use('/api/puzzles', require('./routes/puzzleRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // السطر ده ناقص عندك!


// Error Handler بسيط عشان السيرفر ما يقعش لو حصل غلط
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});