const express = require('express');
const router = express.Router();
const {
  getItems,
  createItem,
  updatePurchased,
  updateBreakdownItem,
  deleteItem,
} = require('../controllers/wishlistController');

router.get('/',                        getItems);
router.post('/',                       createItem);
router.patch('/:id',                   updatePurchased);
router.patch('/:id/breakdown/:key',    updateBreakdownItem);
router.delete('/:id',                  deleteItem);

module.exports = router;