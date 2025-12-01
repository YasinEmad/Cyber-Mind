const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

const cookieParser = require('cookie-parser');
const cors = require('cors');

// Body parser
app.use(express.json());
app.use(cookieParser());

// Configure CORS so that the frontend can call the backend directly during development.
// Allow credentials (cookies) and allow the client origin from environment or default to vite's dev server.
app.use(cors({
	origin: process.env.CLIENT_URL || 'http://localhost:5173',
	credentials: true,
}));

// Mount routers
const challengeRoutes = require('./routes/challengeRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const puzzleRoutes = require('./routes/puzzleRoutes');


app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/puzzles', puzzleRoutes);


app.use(errorHandler);

module.exports = app;
