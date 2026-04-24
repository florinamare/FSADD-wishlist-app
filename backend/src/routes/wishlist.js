const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  getItems,
  createItem,
  updatePurchased,
  updateBreakdownItem,
  deleteItem,
  uploadImage,
} = require('../controllers/wishlistController');
const {
  createItem: createItemSchema,
  updatePurchased: updatePurchasedSchema,
  updateBreakdown: updateBreakdownSchema,
} = require('../validators/wishlistSchemas');

router.use(authMiddleware);

router.get('/', getItems);
router.post('/', validate(createItemSchema), createItem);
router.patch('/:id', validate(updatePurchasedSchema), updatePurchased);
router.patch('/:id/breakdown/:key', validate(updateBreakdownSchema), updateBreakdownItem);
router.delete('/:id', deleteItem);
router.post('/:id/image', upload.single('image'), uploadImage);

module.exports = router;
