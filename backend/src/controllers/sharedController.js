const User = require('../models/User');
const WishlistItem = require('../models/WishlistItem');

// GET /api/shared/:shareToken
const getSharedWishlist = async (req, res) => {
  try {
    const user = await User.findOne({ shareToken: req.params.shareToken }).select('username');
    if (!user) return res.status(404).json({ error: 'Wishlist not found.' });

    const items = await WishlistItem.find({ userId: user._id }).sort({ createdAt: -1 });
    return res.json({ username: user.username, items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve shared wishlist.' });
  }
};

// PATCH /api/shared/:shareToken/items/:id
const updateSharedItem = async (req, res) => {
  try {
    const { purchased, boughtBy } = req.body;

    if (typeof purchased !== 'boolean') {
      return res.status(400).json({ error: 'Field purchased must be a boolean.' });
    }

    const user = await User.findOne({ shareToken: req.params.shareToken }).select('_id');
    if (!user) return res.status(404).json({ error: 'Wishlist not found.' });

    const update = { purchased };
    if (typeof boughtBy === 'string') update.boughtBy = boughtBy.trim() || null;

    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update item.' });
  }
};

module.exports = { getSharedWishlist, updateSharedItem };
