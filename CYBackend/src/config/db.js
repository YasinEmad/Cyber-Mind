// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 1. Get the URI from environment variables.
    // 2. If it's not found, use a local default (great for development).
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber-mind';

    // Options for the connection
    const options = {
      serverSelectionTimeoutMS: 5000, // Fail fast if no connection
    };

    // Connect using the single, complete URI
    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure
    process.exit(1);
  }
};

module.exports = connectDB;