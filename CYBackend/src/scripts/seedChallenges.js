const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const connectDB = require('../config/db');

// Debug: make sure the URI is correct
console.log('Mongo URI:', process.env.MONGODB_URI);

const challenges = [
  {
    title: 'SQL Injection: Login Bypass',
    description: 'Find and fix the SQL injection vulnerability in the login function.',
    code: "const q = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`",
    level: 'easy',
    hints: ['Avoid string interpolation in SQL', 'Use parameterized queries'],
    challengeDetails: 'Exploit the login and propose a fix using parameterized queries.',
    recommendation: 'Use parameterized queries and proper hashing for passwords.',
    feedback: '',
    points: 100,
  },
  {
    title: 'XSS: Output Encoding',
    description: 'Prevent stored XSS by escaping user-provided content.',
    code: "res.send('<div>' + userInput + '</div>')",
    level: 'medium',
    hints: ['Encode HTML output', 'Use template escaping helpers'],
    challengeDetails: 'Demonstrate how unsanitized input leads to XSS and fix it.',
    recommendation: 'Escape or sanitize user content before rendering.',
    feedback: '',
    points: 200,
  },
  {
    title: 'Insecure Token',
    description: 'Sensitive data is included in base64 token. Secure the token generation.',
    code: "return Buffer.from(JSON.stringify(user)).toString('base64')",
    level: 'medium',
    hints: ['Use JWT with secret', 'Do not include SSN or password in tokens'],
    challengeDetails: 'Replace insecure encoding with signed JWT and strip sensitive fields.',
    recommendation: 'Use jwt.sign() and exclude sensitive claims.',
    feedback: '',
    points: 250,
  },
  {
    title: 'Race Condition: File Write',
    description: 'Concurrent file writes can corrupt data. Add locking or queueing.',
    code: "fs.writeFileSync('/data/' + id + '.json', payload)",
    level: 'hard',
    hints: ['Use atomic file ops', 'Use advisory locks or database transactions'],
    challengeDetails: 'Show how concurrent requests can corrupt files and fix using locks.',
    recommendation: 'Use proper synchronization or transactional storage.',
    feedback: '',
    points: 400,
  },
  {
    title: 'Unvalidated Redirect',
    description: 'Open redirect vulnerability allows phishing. Validate redirect targets.',
    code: "res.redirect(req.query.next)",
    level: 'easy',
    hints: ['Validate redirect against whitelist', 'Avoid open redirects'],
    challengeDetails: 'Demonstrate open redirect exploitation and implement whitelist.',
    recommendation: 'Whitelist allowed URLs and use relative redirects only.',
    feedback: '',
    points: 80,
  }
];

const seedChallenges = async () => {
  try {
    await connectDB();
    await Challenge.deleteMany({});
    console.log('Existing challenges removed');
    await Challenge.insertMany(challenges);
    console.log('Challenges seeded successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedChallenges();
