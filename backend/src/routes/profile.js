const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, updateProfile, updatePassword } = require('../controllers/profileController');

router.use(auth);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/password', updatePassword);

module.exports = router;
