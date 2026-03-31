const User = require('../models/User');
const WishlistItem = require('../models/WishlistItem');
const Friend = require('../models/Friend');
const Notification = require('../models/Notification');

// GET /api/shared/:shareToken
// Query param opțional: ?visitorToken=<shareToken-ul vizitatorului>
const getSharedWishlist = async (req, res) => {
  try {
    const owner = await User.findOne({ shareToken: req.params.shareToken }).select('username');
    if (!owner) return res.status(404).json({ error: 'Wishlist not found.' });

    const items = await WishlistItem.find({ userId: owner._id }).sort({ createdAt: -1 });

    // Înregistrează vizitatorul dacă trimite propriul shareToken
    const { visitorToken } = req.query;
    if (visitorToken && visitorToken !== req.params.shareToken) {
      const visitor = await User.findOne({ shareToken: visitorToken }).select('_id username');
      if (visitor) {
        await Friend.findOneAndUpdate(
          { ownerId: owner._id, visitorId: visitor._id },
          { visitorName: visitor.username, visitedAt: new Date() },
          { upsert: true, new: true }
        );
        await Notification.create({
          userId: owner._id,
          type: 'visited',
          message: `${visitor.username} ți-a vizitat wishlist-ul.`,
        });
      }
    }

    return res.json({ username: owner.username, items });
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

    if (purchased) {
      const buyer = update.boughtBy || 'Cineva';
      await Notification.create({
        userId: user._id,
        type: 'purchased',
        message: `${buyer} a bifat "${item.name}" ca cumpărat.`,
        itemName: item.name,
        boughtBy: update.boughtBy || null,
      });
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update item.' });
  }
};

// PATCH /api/shared/:shareToken/items/:id/breakdown/:key
const updateSharedBreakdownItem = async (req, res) => {
  try {
    const { purchased } = req.body;
    if (typeof purchased !== 'boolean') {
      return res.status(400).json({ error: 'Field purchased must be a boolean.' });
    }

    const user = await User.findOne({ shareToken: req.params.shareToken }).select('_id');
    if (!user) return res.status(404).json({ error: 'Wishlist not found.' });

    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { $set: { 'breakdown.$[elem].purchased': purchased } },
      {
        arrayFilters: [{ 'elem.key': req.params.key }],
        new: true,
        runValidators: true,
      }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update breakdown item.' });
  }
};

module.exports = { getSharedWishlist, updateSharedItem, updateSharedBreakdownItem };
