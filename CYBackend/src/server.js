// server.js

// 1. Load environment variables AT THE TOP
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db'); // Path to your db file

// Initialize express app
const app = express();

// 2. Connect to MongoDB
connectDB();

// 3. Global Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// 4. Routes
app.use('/api/puzzles', require('./routes/puzzleRoutes'));

// 5. Error Handling Middleware
// TODO: Add your error handling middleware here


// 6. Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});