const express = require('express');
const router = express.Router();
const { getAllUsers, grantAdmin, revokeAdmin } = require('../controllers/adminController');

// التعديل هنا: استدعاء الحارس من الملف الجديد الموحد
const { authAdmin } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const requireRole = require('../middlewares/requireRole');

router.get('/users', authAdmin, getAllUsers);
// Apply rate limiting and require a 'superadmin' role for state-changing admin endpoints.
router.post('/users/grant-admin', authAdmin, requireRole('superadmin'), adminLimiter, grantAdmin);
router.post('/users/revoke-admin', authAdmin, requireRole('superadmin'), adminLimiter, revokeAdmin);

module.exports = router;