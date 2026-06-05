const express = require('express');
const router = express.Router();
const { getAllUsers, grantAdmin, revokeAdmin } = require('../controllers/adminController');

// التعديل هنا: استدعاء الحارس من الملف الجديد الموحد
const { authAdmin } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');

router.get('/users', authAdmin, getAllUsers);
// Apply rate limiting for state-changing admin endpoints.
router.post('/users/grant-admin', authAdmin, adminLimiter, grantAdmin);
router.post('/users/revoke-admin', authAdmin, adminLimiter, revokeAdmin);

module.exports = router;