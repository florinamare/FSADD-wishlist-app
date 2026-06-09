const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getNotifications, markAllRead } = require('../controllers/notificationsController');

router.get('/', auth, getNotifications);
router.patch('/read-all', auth, markAllRead);

module.exports = router;
