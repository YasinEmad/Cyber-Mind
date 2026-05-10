const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize } = require('../config/db');
const { Challenge } = require('../models');
const { connectDB } = require('../config/db');

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
  },
  {
    title: 'CSRF Protection',
    description: 'Implement CSRF protection for form submissions.',
    code: "app.post('/transfer', (req, res) => { /* no CSRF check */ })",
    level: 'medium',
    hints: ['Use CSRF tokens', 'Check origin headers'],
    challengeDetails: 'Add CSRF token validation.',
    recommendation: 'Use middleware like csurf.',
    points: 150,
    solution: "csurf|csrf",
    validationType: 'regex'
  },
  {
    title: 'Session Fixation',
    description: 'Prevent session fixation attacks.',
    code: "req.session.userId = user.id; // without regenerating session",
    level: 'hard',
    hints: ['Regenerate session ID after login', 'Use secure session management'],
    challengeDetails: 'Regenerate the session ID upon authentication.',
    recommendation: 'Call req.session.regenerate() after login.',
    points: 300,
    solution: "regenerate",
    validationType: 'regex'
  },
  {
    title: 'Sensitive Data Exposure',
    description: 'Encrypt sensitive data in transit.',
    code: "http.createServer(app).listen(80); // no HTTPS",
    level: 'easy',
    hints: ['Use HTTPS', 'Redirect HTTP to HTTPS'],
    challengeDetails: 'Implement HTTPS for secure communication.',
    recommendation: 'Use certificates and force HTTPS.',
    points: 100,
    solution: "https|ssl|tls",
    validationType: 'regex'
  },
  {
    title: 'XML External Entity (XXE)',
    description: 'Prevent XXE attacks in XML parsing.',
    code: "const parser = new DOMParser(); parser.parseFromString(xml, 'text/xml');",
    level: 'hard',
    hints: ['Disable external entities', 'Use safe XML parsers'],
    challengeDetails: 'Configure the parser to not resolve external entities.',
    recommendation: 'Set options to disable external DTD.',
    points: 350,
    solution: "disable|safe|secure",
    validationType: 'regex'
  },
  {
    title: 'Broken Access Control',
    description: 'Fix IDOR vulnerability.',
    code: "const user = await User.findById(req.params.id); // no ownership check",
    level: 'medium',
    hints: ['Check user ownership', 'Use authorization middleware'],
    challengeDetails: 'Verify that the user can only access their own data.',
    recommendation: 'Add if (user.id !== req.user.id) checks.',
    points: 200,
    solution: "ownership|authorization|check",
    validationType: 'regex'
  },
  {
    title: 'Security Misconfiguration',
    description: 'Change default credentials.',
    code: "const db = mysql.createConnection({ user: 'root', password: '' });",
    level: 'easy',
    hints: ['Use environment variables', 'Strong passwords'],
    challengeDetails: 'Use secure credentials from environment.',
    recommendation: 'Store secrets in .env files.',
    points: 100,
    solution: "process\\.env|env",
    validationType: 'regex'
  },
  {
    title: 'Insufficient Logging',
    description: 'Add logging for security events.',
    code: "app.post('/login', (req, res) => { /* no logging */ });",
    level: 'medium',
    hints: ['Log failed logins', 'Use logging libraries'],
    challengeDetails: 'Log authentication attempts.',
    recommendation: 'Use winston or morgan for logging.',
    points: 150,
    solution: "log|winston|morgan",
    validationType: 'regex'
  },
  {
    title: 'Deserialization Vulnerability',
    description: 'Avoid deserializing untrusted data.',
    code: "const obj = JSON.parse(userInput);",
    level: 'hard',
    hints: ['Validate input', 'Use safe deserialization'],
    challengeDetails: 'Sanitize or avoid deserializing user input.',
    recommendation: 'Use JSON schema validation.',
    points: 300,
    solution: "validate|schema",
    validationType: 'regex'
  },
  {
    title: 'Known Vulnerabilities',
    description: 'Update vulnerable libraries.',
    code: "const express = require('express@2.0.0'); // old version",
    level: 'easy',
    hints: ['Check for updates', 'Use npm audit'],
    challengeDetails: 'Update to latest secure version.',
    recommendation: 'Run npm update and audit.',
    points: 100,
    solution: "update|latest",
    validationType: 'regex'
  },
  {
    title: 'Insufficient Attack Protection',
    description: 'Implement rate limiting.',
    code: "app.post('/api', (req, res) => { /* no rate limit */ });",
    level: 'medium',
    hints: ['Use rate limiting middleware', 'Prevent brute force'],
    challengeDetails: 'Add rate limiting to API endpoints.',
    recommendation: 'Use express-rate-limit.',
    points: 200,
    solution: "rate.limit|express-rate-limit",
    validationType: 'regex'
  },
  {
    title: 'Command Injection',
    description: 'Prevent command injection.',
    code: "exec(`ls ${userInput}`);",
    level: 'easy',
    hints: ['Sanitize input', 'Use child_process.spawn with array'],
    challengeDetails: 'Avoid shell interpolation.',
    recommendation: 'Use execFile or spawn with arguments array.',
    points: 150,
    solution: "spawn|execFile",
    validationType: 'regex'
  },
  {
    title: 'Path Traversal',
    description: 'Prevent directory traversal attacks.',
    code: "fs.readFileSync(path.join(__dirname, req.query.file));",
    level: 'medium',
    hints: ['Validate paths', 'Use path.resolve and check'],
    challengeDetails: 'Ensure file paths are within allowed directories.',
    recommendation: 'Normalize and validate paths.',
    points: 200,
    solution: "resolve|normalize|validate",
    validationType: 'regex'
  },
  {
    title: 'Unvalidated Redirects',
    description: 'Validate redirect URLs.',
    code: "res.redirect(req.query.url);",
    level: 'easy',
    hints: ['Whitelist allowed URLs', 'Validate host'],
    challengeDetails: 'Only allow redirects to trusted domains.',
    recommendation: 'Check against a list of allowed URLs.',
    points: 100,
    solution: "whitelist|validate|allowed",
    validationType: 'regex'
  },
  {
    title: 'Insecure Direct Object References',
    description: 'Fix IDOR in file access.',
    code: "const file = fs.readFileSync(`files/${req.params.id}.txt`);",
    level: 'medium',
    hints: ['Check permissions', 'Use user-specific directories'],
    challengeDetails: 'Ensure users can only access their files.',
    recommendation: 'Include user ID in path.',
    points: 200,
    solution: "user|permission|check",
    validationType: 'regex'
  },
  {
    title: 'Race Conditions',
    description: 'Handle concurrent access safely.',
    code: "if (balance > amount) balance -= amount; // no lock",
    level: 'hard',
    hints: ['Use locks or transactions', 'Atomic operations'],
    challengeDetails: 'Use database transactions for consistency.',
    recommendation: 'Wrap in transaction.',
    points: 350,
    solution: "transaction|lock",
    validationType: 'regex'
  },
  {
    title: 'Buffer Overflow',
    description: 'Prevent buffer overflows in C code.',
    code: "char buf[10]; strcpy(buf, input);",
    level: 'hard',
    hints: ['Use safe functions', 'Check lengths'],
    challengeDetails: 'Use strncpy or safer alternatives.',
    recommendation: 'Use bounded string functions.',
    points: 300,
    solution: "strncpy|safe|bounded",
    validationType: 'regex'
  },
  {
    title: 'Integer Overflow',
    description: 'Check for integer overflows.',
    code: "int total = a + b; // no check",
    level: 'medium',
    hints: ['Use safe math libraries', 'Check before addition'],
    challengeDetails: 'Validate inputs to prevent overflow.',
    recommendation: 'Use BigInt or checks.',
    points: 250,
    solution: "BigInt|check|safe",
    validationType: 'regex'
  },
  {
    title: 'Format String Vulnerability',
    description: 'Fix format string vulnerabilities.',
    code: "printf(userInput);",
    level: 'hard',
    hints: ['Use format specifiers carefully', 'Avoid user input in format'],
    challengeDetails: 'Do not pass user input as format string.',
    recommendation: 'Use printf("%s", userInput);',
    points: 300,
    solution: "%s|format",
    validationType: 'regex'
  },
  {
    title: 'Hardcoded Credentials',
    description: 'Remove hardcoded secrets.',
    code: "const apiKey = 'secret123';",
    level: 'easy',
    hints: ['Use environment variables', 'Config files'],
    challengeDetails: 'Load secrets from environment.',
    recommendation: 'Use process.env.API_KEY',
    points: 100,
    solution: "process\\.env",
    validationType: 'regex'
  },
  {
    title: 'Weak Cryptography',
    description: 'Use strong encryption algorithms.',
    code: "crypto.createCipher('des', key); // weak",
    level: 'medium',
    hints: ['Use AES', 'Avoid deprecated algorithms'],
    challengeDetails: 'Replace with AES-256.',
    recommendation: 'Use crypto.createCipher(\'aes-256-cbc\c\', key);',
    points: 200,
    solution: "aes|strong",
    validationType: 'regex'
  }
];

const seedChallenges = async () => {
  try {
    await connectDB();
    // بنمسح القديم وننزل الجديد بالحلول
    await Challenge.destroy({ truncate: true });
    console.log('Existing challenges removed');
    
    await Challenge.bulkCreate(challenges);
    console.log('Challenges seeded successfully with solutions!');
    
    await sequelize.close();
  } catch (err) {
    console.error('Seeding failed', err);
    await sequelize.close();
    process.exit(1);
  }
};

seedChallenges();