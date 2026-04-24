const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');

// GET /api/wishlists
const getWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ userId: req.userId }).sort({
      isDefault: -1,
      createdAt: 1,
    });
    return res.json(wishlists);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve wishlists.' });
  }
};

// POST /api/wishlists
const createWishlist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const wishlist = await Wishlist.create({ userId: req.userId, name, description });
    return res.status(201).json(wishlist);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to create wishlist.' });
  }
};

// PATCH /api/wishlists/:id
const updateWishlist = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;

    const wishlist = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found.' });
    return res.json(wishlist);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to update wishlist.' });
  }
};

// DELETE /api/wishlists/:id
const deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ _id: req.params.id, userId: req.userId });
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found.' });
    if (wishlist.isDefault) {
      return res.status(400).json({ error: 'Cannot delete the default wishlist.' });
    }

    await WishlistItem.deleteMany({ wishlistId: req.params.id });
    await wishlist.deleteOne();

    return res.json({ message: 'Wishlist and its items deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete wishlist.' });
  }
};

// GET /api/wishlists/shared/:shareToken  (public - no auth)
const getSharedWishlistByToken = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ shareToken: req.params.shareToken }).populate(
      'userId',
      'username'
    );
    if (!wishlist) return res.status(404).json({ error: 'Wishlist not found.' });

    const items = await WishlistItem.find({ wishlistId: wishlist._id }).sort({ createdAt: -1 });

    return res.json({
      wishlistId: wishlist._id,
      name: wishlist.name,
      description: wishlist.description,
      username: wishlist.userId.username,
      items,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve shared wishlist.' });
  }
};

module.exports = {
  getWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  getSharedWishlistByToken,
};
