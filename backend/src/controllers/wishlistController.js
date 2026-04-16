const WishlistItem = require('../models/WishlistItem');
const Wishlist = require('../models/Wishlist');

// Finds or creates the default wishlist for a user
const getOrCreateDefaultWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId, isDefault: true });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, name: 'My Wishlist', isDefault: true });
  }
  return wishlist;
};

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get paginated wishlist items for the authenticated user
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: wishlistId
 *         schema: { type: string }
 *         description: Filter by specific wishlist ID
 *     responses:
 *       200:
 *         description: Paginated list of items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedItems'
 */
const getItems = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { userId: req.userId };
    if (req.query.wishlistId) filter.wishlistId = req.query.wishlistId;

    const [items, total] = await Promise.all([
      WishlistItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WishlistItem.countDocuments(filter),
    ]);

    return res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve items.' });
  }
};

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new wishlist item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemInput'
 *     responses:
 *       201:
 *         description: Item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 */
const createItem = async (req, res) => {
  try {
    const { name, price, priority, breakdown, wishlistId } = req.body;

    let resolvedWishlistId = wishlistId;
    if (!resolvedWishlistId) {
      const defaultWishlist = await getOrCreateDefaultWishlist(req.userId);
      resolvedWishlistId = defaultWishlist._id;
    } else {
      const exists = await Wishlist.exists({ _id: resolvedWishlistId, userId: req.userId });
      if (!exists) return res.status(404).json({ error: 'Wishlist not found.' });
    }

    const item = new WishlistItem({
      userId: req.userId,
      wishlistId: resolvedWishlistId,
      name,
      price,
      priority: priority || 'medium',
      purchased: false,
      breakdown: Array.isArray(breakdown) && breakdown.length > 0 ? breakdown : null,
    });

    const saved = await item.save();
    return res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to add item.' });
  }
};

/**
 * @swagger
 * /items/{id}:
 *   patch:
 *     summary: Update purchased status of an item
 *     tags: [Items]
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
 *               purchased: { type: boolean }
 *               boughtBy: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Updated item
 *       404:
 *         description: Item not found
 */
const updatePurchased = async (req, res) => {
  try {
    const { purchased, boughtBy } = req.body;

    const update = { purchased };
    if (boughtBy !== undefined) update.boughtBy = boughtBy || null;

    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update item.' });
  }
};

// PATCH /api/items/:id/breakdown/:key
const updateBreakdownItem = async (req, res) => {
  try {
    const { id, key } = req.params;
    const { purchased } = req.body;

    const item = await WishlistItem.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { 'breakdown.$[elem].purchased': purchased } },
      { arrayFilters: [{ 'elem.key': key }], new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update breakdown.' });
  }
};

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete a wishlist item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item deleted
 *       404:
 *         description: Item not found
 */
const deleteItem = async (req, res) => {
  try {
    const item = await WishlistItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete item.' });
  }
};

/**
 * @swagger
 * /items/{id}/image:
 *   post:
 *     summary: Upload an image for a wishlist item
 *     tags: [Items]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded, item updated
 *       400:
 *         description: No image provided
 *       404:
 *         description: Item not found
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    const imageUrl = `/uploads/${req.file.filename}`;
    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { imageUrl } },
      { new: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
};

module.exports = {
  getItems,
  createItem,
  updatePurchased,
  updateBreakdownItem,
  deleteItem,
  uploadImage,
};
