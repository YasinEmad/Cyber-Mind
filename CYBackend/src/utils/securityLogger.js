const fs = require('fs');
const path = require('path');

// Simple structured security logger. Writes to stdout and optionally to a file.
// Designed to be small and dependency-free; for production, integrate with
// a central logging/monitoring service (SIEM).

const LOG_PATH = process.env.SECURITY_LOG_PATH || path.join(__dirname, '../logs/security.log');

function safeStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return String(obj);
  }
}

function writeToFile(entry) {
  try {
    // Ensure directory exists
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, entry + '\n');
  } catch (e) {
    // If file logging fails, don't throw — fallback to console only.
    console.error('securityLogger file write failed:', e && e.message);
  }
}

function logSecurityEvent(event, data = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    event,
    ...data,
  };

  // Console log in structured form
  console.warn('[SECURITY]', safeStringify(record));

  // Optionally persist to file for audits
  if (process.env.SECURITY_LOG_TO_FILE === 'true') {
    writeToFile(safeStringify(record));
  }

  // Note: In production, forward to external monitoring (SIEM) here.
}

module.exports = { logSecurityEvent };
