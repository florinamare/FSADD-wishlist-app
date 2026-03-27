const express = require('express');
const router = express.Router();
const { getBudget, adjustBudget } = require('../controllers/budgetController');

router.get('/', getBudget);
router.patch('/', adjustBudget);

module.exports = router;
