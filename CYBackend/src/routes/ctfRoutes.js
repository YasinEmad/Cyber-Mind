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

const { executeCTFCommand } = require('../controllers/ctfExecutionController');

const { authAdmin } = require('../middlewares/auth');

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

// Admin routes for CTF level management
router.get('/admin/levels', getAllCTFLevels);
router.get('/admin/levels/:id', getCTFLevelById);
router.post('/admin/levels', createCTFLevel);
router.put('/admin/levels/:id', updateCTFLevel);
router.delete('/admin/levels/:id', deleteCTFLevel);
router.patch('/admin/levels/:id/toggle', toggleCTFLevelStatus);
// Command templates
// Templates CRUD - admin only
router.get('/templates', authAdmin, getCommandTemplates);
router.get('/templates/:id', authAdmin, getCommandTemplateById);
router.post('/templates', authAdmin, createCommandTemplate);
router.put('/templates/:id', authAdmin, updateCommandTemplate);
router.delete('/templates/:id', authAdmin, deleteCommandTemplate);
// Execute a command in CTF mode (path-aware, backend-controlled)
router.post('/execute', executeCTFCommand);

module.exports = router;
