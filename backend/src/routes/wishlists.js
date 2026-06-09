const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const {
  getWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  getSharedWishlistByToken,
} = require('../controllers/wishlistsController');
const { create, update } = require('../validators/wishlistsSchemas');

/**
 * @swagger
 * /wishlists:
 *   get:
 *     summary: Get all wishlists for the authenticated user
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of wishlists
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wishlist'
 */
router.get('/', auth, getWishlists);

/**
 * @swagger
 * /wishlists:
 *   post:
 *     summary: Create a new wishlist
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *               description: { type: string, maxLength: 300 }
 *     responses:
 *       201:
 *         description: Wishlist created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 */
router.post('/', auth, validate(create), createWishlist);

/**
 * @swagger
 * /wishlists/{id}:
 *   patch:
 *     summary: Update a wishlist's name or description
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Updated wishlist
 *       404:
 *         description: Wishlist not found
 */
router.patch('/:id', auth, validate(update), updateWishlist);

/**
 * @swagger
 * /wishlists/{id}:
 *   delete:
 *     summary: Delete a wishlist and all its items
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Wishlist deleted
 *       400:
 *         description: Cannot delete the default wishlist
 *       404:
 *         description: Wishlist not found
 */
router.delete('/:id', auth, deleteWishlist);

/**
 * @swagger
 * /wishlists/shared/{shareToken}:
 *   get:
 *     summary: Get a specific shared wishlist by its shareToken (public)
 *     tags: [Wishlists]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shared wishlist data with items
 *       404:
 *         description: Wishlist not found
 */
router.get('/shared/:shareToken', getSharedWishlistByToken);

module.exports = router;
