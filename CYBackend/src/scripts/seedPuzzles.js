const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
console.log(process.env.MONGODB_URI);
const mongoose = require('mongoose');
const Puzzle = require('../models/Puzzle');
const connectDB = require('../config/db');

const puzzles = [
  {
    title: "The Enigmatic Firewall",
    description: "A simple puzzle to bypass a misconfigured firewall.",
    level: 1,
    hints: ["Check the firewall rules.", "Look for any permissive rules."],
    scenario: "You are a penetration tester and you need to access a web server behind a firewall.",
    category: "Network Security",
    answer: "Rule 5: 'allow tcp any any port 80'" // Added answer
  },
  {
    title: "SQL Injection 101",
    description: "A classic SQL injection challenge.",
    level: 2,
    hints: ["' OR 1=1 --", "Try to bypass authentication."],
    scenario: "You have found a login page that might be vulnerable to SQL injection.",
    category: "Web Security",
    answer: "' OR 1=1 --" // Added answer
  },
  {
    title: "Cross-Site Scripting (XSS) Fun",
    description: "Inject a script to pop up an alert.",
    level: 1,
    hints: ["<script>alert('XSS')</script>", "Look for input fields that are not properly sanitized."],
    scenario: "You have found a comment box on a blog that seems to be vulnerable to XSS.",
    category: "Web Security",
    answer: "<script>alert('XSS')</script>" // Added answer
  },
  {
    title: "Reverse Engineering a Simple Binary",
    description: "Find the flag in a simple binary file.",
    level: 3,
    hints: ["Use a disassembler like Ghidra or IDA Pro.", "Look for hardcoded strings."],
    scenario: "You have been given a binary file and you need to find the hidden flag.",
    category: "Reverse Engineering",
    answer: "flag{r3v3r53_m3_1f_y0u_c4n}" // Added answer
  },
  {
    title: "The Caesar Cipher",
    description: "A classic cryptography challenge.",
    level: 1,
    hints: ["The key is 3.", "Shift the letters of the alphabet."],
    scenario: "You have intercepted an encrypted message and you need to decrypt it.",
    category: "Cryptography",
    answer: "3" // Added answer
  },
  {
    title: "Phishing Expedition",
    description: "Identify the phishing email from a set of emails.",
    level: 2,
    hints: ["Check the sender's email address.", "Look for suspicious links."],
    scenario: "You are an employee of a company and you have received a suspicious email.",
    category: "Social Engineering",
    answer: "The email from 'support@paypaI.com' (with a capital I)" // Added answer
  },
  {
    title: "The Locked Down Server",
    description: "Gain root access to a Linux server.",
    level: 4,
    hints: ["Look for kernel exploits.", "Try to escalate privileges."],
    scenario: "You have gained limited access to a Linux server and you need to become root.",
    category: "Privilege Escalation",
    answer: "CVE-2021-4034" // Added answer
  },
  {
    title: "Wi-Fi Cracking",
    description: "Crack a WPA2-PSK protected Wi-Fi network.",
    level: 3,
    hints: ["Use aircrack-ng.", "Capture the handshake."],
    scenario: "You are a security auditor and you need to test the security of a Wi-Fi network.",
    category: "Wireless Security",
    answer: "password123" // Added answer
  },
  {
    title: "The Mysterious USB Drive",
    description: "Analyze a USB drive for malware.",
    level: 2,
    hints: ["Use a tool like Autopsy.", "Look for suspicious files."],
    scenario: "You have found a USB drive and you need to analyze it for malware.",
    category: "Forensics",
    answer: "keylogger.exe" // Added answer
  },
  {
    title: "The Social Media Puzzle",
    description: "Find information about a person using social media.",
    level: 1,
    hints: ["Use Google dorks.", "Check their public profiles."],
    scenario: "You are a private investigator and you need to find information about a person.",
    category: "OSINT",
    answer: "The target's pet's name is 'Fluffy'" // Added answer
  }
];

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