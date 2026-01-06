const express = require('express');
const router = express.Router();
const { getAllUsers, grantAdmin, revokeAdmin } = require('../controllers/adminController');

// التعديل هنا: استدعاء الحارس من الملف الجديد الموحد
const { authAdmin } = require('../middlewares/auth'); 

router.get('/users', authAdmin, getAllUsers);
router.post('/users/grant-admin', authAdmin, grantAdmin);
router.post('/users/revoke-admin', authAdmin, revokeAdmin);

module.exports = router;