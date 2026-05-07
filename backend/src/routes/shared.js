const express = require('express');
const router = express.Router();
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const { getSharedWishlist, updateSharedItem, updateSharedBreakdownItem } = require('../controllers/sharedController');

router.get('/:shareToken',                              getSharedWishlist);
router.patch('/:shareToken/items/:id',                  optionalAuth, updateSharedItem);
router.patch('/:shareToken/items/:id/breakdown/:key',   optionalAuth, updateSharedBreakdownItem);

module.exports = router;
