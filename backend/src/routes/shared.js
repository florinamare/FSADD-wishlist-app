const express = require('express');
const router = express.Router();
const { getSharedWishlist, updateSharedItem } = require('../controllers/sharedController');

router.get('/:shareToken',           getSharedWishlist);
router.patch('/:shareToken/items/:id', updateSharedItem);

module.exports = router;
