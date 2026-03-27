const WishlistItem = require('../models/WishlistItem');

// GET /api/items
const getItems = async (req, res) => {
  try {
    const items = await WishlistItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve items.' });
  }
};

// POST /api/items
const createItem = async (req, res) => {
  try {
    const { name, price, priority, breakdown } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Fields name and price are required.' });
    }

    const item = new WishlistItem({
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

// PATCH /api/items/:id
const updatePurchased = async (req, res) => {
  try {
    const { purchased } = req.body;

    if (typeof purchased !== 'boolean') {
      return res.status(400).json({ error: 'Field purchased must be a boolean.' });
    }

    const item = await WishlistItem.findByIdAndUpdate(
      req.params.id,
      { $set: { purchased } },
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

    const validKeys = ['accommodation', 'flights', 'food', 'activities'];
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        error: `Invalid key. Accepted values: ${validKeys.join(', ')}`,
      });
    }

    if (typeof purchased !== 'boolean') {
      return res.status(400).json({ error: 'Field purchased must be a boolean.' });
    }

    const item = await WishlistItem.findByIdAndUpdate(
      id,
      { $set: { 'breakdown.$[elem].purchased': purchased } },
      {
        arrayFilters: [{ 'elem.key': key }],
        new: true,
        runValidators: true,
      }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update breakdown.' });
  }
};

// DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const item = await WishlistItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete item.' });
  }
};

module.exports = {
  getItems,
  createItem,
  updatePurchased,
  updateBreakdownItem,
  deleteItem,
};
