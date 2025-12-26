const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
console.log(process.env.MONGODB_URI);
const mongoose = require('mongoose');
const Puzzle = require('../models/Puzzle');
const connectDB = require('../config/db');
const puzzles = [
  { title: "Puzzle 1", description: "Solve the math riddle", level: 1, scenario: "Math challenge", tag: "puzzle1", answer: "1", category: "Math" },
  { title: "Puzzle 2", description: "Find the hidden word", level: 1, scenario: "Word search", tag: "puzzle2", answer: "1", category: "Word" },
  { title: "Puzzle 3", description: "Logic deduction puzzle", level: 1, scenario: "Logic test", tag: "puzzle3", answer: "1", category: "Logic" },
  { title: "Puzzle 4", description: "Pattern recognition", level: 2, scenario: "Identify the sequence", tag: "puzzle4", answer: "1", category: "Math" },
  { title: "Puzzle 5", description: "Riddle of the day", level: 2, scenario: "Riddle", tag: "puzzle5", answer: "1", category: "Riddle" },
  { title: "Puzzle 6", description: "Cryptic clue", level: 2, scenario: "Cryptography", tag: "puzzle6", answer: "1", category: "Crypto" },
  { title: "Puzzle 7", description: "Logic grid puzzle", level: 2, scenario: "Logic", tag: "puzzle7", answer: "1", category: "Logic" },
  { title: "Puzzle 8", description: "Math challenge", level: 2, scenario: "Equations", tag: "puzzle8", answer: "1", category: "Math" },
  { title: "Puzzle 9", description: "Word puzzle", level: 2, scenario: "Unscramble", tag: "puzzle9", answer: "1", category: "Word" },
  { title: "Puzzle 10", description: "Brain teaser", level: 2, scenario: "Teaser", tag: "puzzle10", answer: "1", category: "Riddle" },
  { title: "Puzzle 11", description: "Advanced math", level: 3, scenario: "Algebra", tag: "puzzle11", answer: "1", category: "Math" },
  { title: "Puzzle 12", description: "Logic deduction", level: 3, scenario: "Logic", tag: "puzzle12", answer: "1", category: "Logic" },
  { title: "Puzzle 13", description: "Word challenge", level: 3, scenario: "Crossword", tag: "puzzle13", answer: "1", category: "Word" },
  { title: "Puzzle 14", description: "Cryptic code", level: 3, scenario: "Crypto", tag: "puzzle14", answer: "1", category: "Crypto" },
  { title: "Puzzle 15", description: "Sequence puzzle", level: 3, scenario: "Number pattern", tag: "puzzle15", answer: "1", category: "Math" },
  { title: "Puzzle 16", description: "Riddle", level: 2, scenario: "Riddle test", tag: "puzzle16", answer: "1", category: "Riddle" },
  { title: "Puzzle 17", description: "Logic problem", level: 2, scenario: "Deduction", tag: "puzzle17", answer: "1", category: "Logic" },
  { title: "Puzzle 18", description: "Word scramble", level: 1, scenario: "Unscramble letters", tag: "puzzle18", answer: "1", category: "Word" },
  { title: "Puzzle 19", description: "Math quiz", level: 1, scenario: "Arithmetic", tag: "puzzle19", answer: "1", category: "Math" },
  { title: "Puzzle 20", description: "Brain teaser", level: 1, scenario: "Teaser", tag: "puzzle20", answer: "1", category: "Riddle" },
];


// Validate/coerce levels to be integers 1-3
puzzles.forEach(p => {
  if (typeof p.level === 'undefined' || p.level === null) p.level = 1;
  p.level = Number(p.level);
  if (!Number.isInteger(p.level) || ![1,2,3].includes(p.level)) {
    console.warn(`seedPuzzles: puzzle "${p.title}" had invalid level, coercing to 1`);
    p.level = 1;
  }
});
  
const seedPuzzles = async () => {
  try {
    await connectDB();
    await Puzzle.deleteMany({});
    console.log('Puzzles deleted.');
    await Puzzle.insertMany(puzzles);
    console.log('Puzzles seeded successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding puzzles:', error);
    mongoose.disconnect();
    process.exit(1); // Exit process with failure
  }
};


seedPuzzles();