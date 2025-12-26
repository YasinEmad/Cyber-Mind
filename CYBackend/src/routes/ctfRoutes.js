const express = require('express');
const router = express.Router();
const {
  getCTFInfo,
  getCTFLevelInfo,
  getCTFChallenge,
  getCTFChallengeWithFS,
  getAvailableLevels,
  getAllCTFLevels,
  getCTFLevelById,
  createCTFLevel,
  updateCTFLevel,
  deleteCTFLevel,
  toggleCTFLevelStatus,
} = require('../controllers/ctfLevelController');
const {
  getCommandTemplates,
  getCommandTemplateById,
  createCommandTemplate,
  updateCommandTemplate,
  deleteCommandTemplate,
} = require('../controllers/commandTemplateController');

const { 
  executeCTFCommand,
  verifyFlag,
  getUserLevelProgress,
  getUserCompletedLevels,
} = require('../controllers/ctfExecutionController');

const { authAdmin, protect } = require('../middlewares/auth');

// Get all CTF level information
router.get('/info', getCTFInfo);

// Get available CTF levels (list)
router.get('/levels/available', getAvailableLevels);

// Get specific level information
router.get('/info/:level', getCTFLevelInfo);

// Get challenge data for a specific level (without sensitive data exposure)
router.get('/challenge/:level', getCTFChallenge);

// Get challenge with filesystem info for initialization
router.get('/challenge/:level/fs', getCTFChallengeWithFS);

// Admin routes for CTF level management (authentication required)
router.get('/admin/levels', authAdmin, getAllCTFLevels);
router.get('/admin/levels/:id', authAdmin, getCTFLevelById);
router.post('/admin/levels', authAdmin, createCTFLevel);
router.put('/admin/levels/:id', authAdmin, updateCTFLevel);
router.delete('/admin/levels/:id', authAdmin, deleteCTFLevel);
router.patch('/admin/levels/:id/toggle', authAdmin, toggleCTFLevelStatus);
// Command templates
// Templates CRUD - admin only
router.get('/templates', authAdmin, getCommandTemplates);
router.get('/templates/:id', authAdmin, getCommandTemplateById);
router.post('/templates', authAdmin, createCommandTemplate);
router.put('/templates/:id', authAdmin, updateCommandTemplate);
router.delete('/templates/:id', authAdmin, deleteCommandTemplate);
// Execute a command in CTF mode (requires user authentication)
router.post('/execute', protect, executeCTFCommand);

// Verify flag submission (requires authentication)
router.post('/verify-flag/:level', protect, verifyFlag);

// Get user progress for a specific level (requires authentication)
router.get('/user-progress/:level', protect, getUserLevelProgress);

// Get all completed levels for user (requires authentication)
router.get('/user-completed-levels', protect, getUserCompletedLevels);

module.exports = router;
