// deleteAllPuzzles.js
const mongoose = require('mongoose');
const Puzzle = require('../models/Puzzle');

const MONGODB_URI = "mongodb+srv://yemad7676_db_user:YJyMNNz0UfOkAOFl@cluster0.hlszscw.mongodb.net/cybermind?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  const result = await Puzzle.deleteMany({});
  console.log(`Deleted ${result.deletedCount || 0} puzzles from the database.`);

  process.exit(0);
};

run().catch(err => {
  console.error('Error during deleteAllPuzzles:', err.message || err);
  process.exit(1);
});
