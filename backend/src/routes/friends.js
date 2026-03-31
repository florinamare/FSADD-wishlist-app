const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getFriends } = require('../controllers/friendsController');

router.get('/', auth, getFriends);

module.exports = router;
