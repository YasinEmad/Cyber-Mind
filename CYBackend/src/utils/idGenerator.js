/**
 * Utility module for generating unique IDs
 */

const crypto = require('crypto');

/**
 * Generate a unique template ID
 * Format: TMPL_<timestamp>_<random>
 * Example: TMPL_1735689123456_a7f9k2m
 * @returns {string} Unique template ID
 */
function generateTemplateId() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').substring(0, 6);
  return `TMPL_${timestamp}_${random}`;
}

/**
 * Generate a unique challenge ID
 * Format: CHG_<timestamp>_<random>
 * Example: CHG_1735689123456_b8g2l3n
 * @returns {string} Unique challenge ID
 */
function generateChallengeId() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').substring(0, 6);
  return `CHG_${timestamp}_${random}`;
}

/**
 * Generate a unique puzzle ID
 * Format: PUZ_<timestamp>_<random>
 * Example: PUZ_1735689123456_c9h3m4o
 * @returns {string} Unique puzzle ID
 */
function generatePuzzleId() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').substring(0, 6);
  return `PUZ_${timestamp}_${random}`;
}

module.exports = {
  generateTemplateId,
  generateChallengeId,
  generatePuzzleId,
};
