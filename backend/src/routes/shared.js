const express = require('express');
const router = express.Router();
const { getSharedWishlist, updateSharedItem, updateSharedBreakdownItem } = require('../controllers/sharedController');

router.get('/:shareToken',                              getSharedWishlist);
router.patch('/:shareToken/items/:id',                  updateSharedItem);
router.patch('/:shareToken/items/:id/breakdown/:key',   updateSharedBreakdownItem);

module.exports = router;
