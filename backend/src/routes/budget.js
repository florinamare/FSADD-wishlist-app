const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getBudget, adjustBudget } = require('../controllers/budgetController');

router.get('/', auth, getBudget);
router.patch('/', auth, adjustBudget);

module.exports = router;
