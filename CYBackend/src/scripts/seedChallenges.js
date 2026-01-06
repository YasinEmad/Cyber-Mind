const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const connectDB = require('../config/db');

const challenges = [
  {
    title: 'SQL Injection: Login Bypass',
    description: 'Find and fix the SQL injection vulnerability in the login function.',
    code: "const q = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'` line",
    level: 'easy',
    hints: ['Avoid string interpolation in SQL', 'Use parameterized queries'],
    challengeDetails: 'Propose a fix using parameterized queries.',
    recommendation: 'Use parameterized queries or ORM methods.',
    points: 100,
    // الحل: بندور إن اليوزر استخدم علامات الاستفهام '?' أو الـ parameters
    solution: "(\\?|\\$1|db\\.query\\(.*\\,.*\\b\\[.*\\]\\))", 
    validationType: 'regex'
  },
  {
    title: 'XSS: Output Encoding',
    description: 'Prevent stored XSS by escaping user-provided content.',
    code: "res.send('<div>' + userInput + '</div>')",
    level: 'medium',
    hints: ['Encode HTML output', 'Use template escaping helpers'],
    challengeDetails: 'Escape or sanitize user content before rendering.',
    recommendation: 'Use libraries like DOMPurify or escapeHTML functions.',
    points: 200,
    // الحل: بندور على كلمات زي escape أو sanitize أو DOMPurify
solution: ".*(escapeHTML|sanitize|DOMPurify\\.sanitize|encodeURI).*",    validationType: 'regex'
  },
  {
    title: 'Insecure Token',
    description: 'Sensitive data is included in base64 token. Secure it.',
    code: "return Buffer.from(JSON.stringify(user)).toString('base64')",
    level: 'medium',
    hints: ['Use JWT with secret', 'Remove sensitive fields'],
    challengeDetails: 'Replace encoding with signed JWT.',
    recommendation: 'Use jwt.sign() with an environment secret.',
    points: 250,
    solution: "jwt\\.sign",
    validationType: 'regex'
  }
];

const seedChallenges = async () => {
  try {
    await connectDB();
    // بنمسح القديم وننزل الجديد بالحلول
    await Challenge.deleteMany({});
    console.log('Existing challenges removed');
    
    await Challenge.insertMany(challenges);
    console.log('Challenges seeded successfully with solutions!');
    
    mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedChallenges();