const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { getBudget, adjustBudget } = require('../controllers/budgetController');
const { adjust } = require('../validators/budgetSchemas');

router.get('/', auth, getBudget);
router.patch('/', auth, validate(adjust), adjustBudget);

module.exports = router;
