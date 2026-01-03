// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const Puzzle = require('./models/Puzzle'); // 1. لازم تستدعي الموديل هنا

const app = express();


// 3. تعديل الاتصال بالداتابيز لتشغيل الفانكشن
connectDB().then(() => {
    // شغل السطر اللي تحت ده "مرة واحدة" بس وبعدين امسحه أو اعمله كومنت
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/puzzles', require('./routes/puzzleRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});