const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addFriend, getFriends } = require('../controllers/friendsController');

router.post('/', auth, addFriend);
router.get('/',  auth, getFriends);

module.exports = router;
