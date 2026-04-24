const User = require('../models/User');
const WishlistItem = require('../models/WishlistItem');
const Friend = require('../models/Friend');
const Notification = require('../models/Notification');
const { getOrCreate: getOrCreateBudget } = require('./budgetController');

const emitNotification = (userId, notification) => {
  try {
    const { getIO } = require('../config/socket');
    getIO().to(`user:${userId}`).emit('notification:new', notification);
  } catch (_) {
    // Socket not initialized (e.g. during tests)
  }
};

/**
 * @swagger
 * /shared/{shareToken}:
 *   get:
 *     summary: Get a user's shared wishlist by their shareToken
 *     tags: [Shared]
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: visitorToken
 *         schema: { type: string }
 *         description: Visitor's own shareToken to register the visit
 *     responses:
 *       200:
 *         description: Shared wishlist data
 *       404:
 *         description: Wishlist not found
 */
const getSharedWishlist = async (req, res) => {
  try {
    const owner = await User.findOne({ shareToken: req.params.shareToken }).select('username _id');
    if (!owner) return res.status(404).json({ error: 'Wishlist not found.' });

    const items = await WishlistItem.find({ userId: owner._id }).sort({ createdAt: -1 });

    const { visitorToken } = req.query;
    if (visitorToken && visitorToken !== req.params.shareToken) {
      const visitor = await User.findOne({ shareToken: visitorToken }).select('_id username');
      if (visitor) {
        await Friend.findOneAndUpdate(
          { ownerId: owner._id, visitorId: visitor._id },
          { visitorName: visitor.username, visitedAt: new Date() },
          { upsert: true, new: true }
        );

        const notification = await Notification.create({
          userId: owner._id,
          type: 'visited',
          message: `${visitor.username} ți-a vizitat wishlist-ul.`,
        });

        emitNotification(owner._id, notification);
      }
    }

    return res.json({ username: owner.username, items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve shared wishlist.' });
  }
};

/**
 * @swagger
 * /shared/{shareToken}/items/{id}:
 *   patch:
 *     summary: Mark a shared item as purchased
 *     tags: [Shared]
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema: { type: string }
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
 *             required: [purchased]
 *             properties:
 *               purchased: { type: boolean }
 *               boughtBy: { type: string }
 *     responses:
 *       200:
 *         description: Updated item
 */
const updateSharedItem = async (req, res) => {
  try {
    const { purchased, boughtBy } = req.body;

    if (typeof purchased !== 'boolean') {
      return res.status(400).json({ error: 'Field purchased must be a boolean.' });
    }

    const owner = await User.findOne({ shareToken: req.params.shareToken }).select('_id username');
    if (!owner) return res.status(404).json({ error: 'Wishlist not found.' });

    const update = { purchased };
    if (typeof boughtBy === 'string') update.boughtBy = boughtBy.trim() || null;

    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: owner._id },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });

    // Notifică proprietarul wishlist-ului
    if (purchased) {
      const buyer = update.boughtBy || 'Cineva';
      const notification = await Notification.create({
        userId: owner._id,
        type: 'purchased',
        message: `${buyer} a cumpărat "${item.name}".`,
        itemName: item.name,
        boughtBy: update.boughtBy || null,
      });

      emitNotification(owner._id, { type: 'item:purchased', notification });
    }

    // Ajustează bugetul CUMPĂRĂTORULUI autentificat (req.userId = buyer, nu owner)
    if (req.userId) {
      try {
        const buyerBudget = await getOrCreateBudget(req.userId);
        if (purchased) {
          buyerBudget.amount -= item.price;
          buyerBudget.history.push({
            type: 'subtract',
            amount: item.price,
            note: `Cumpărat: ${item.name} (wishlist ${owner.username})`,
            createdAt: new Date(),
          });
        } else {
          buyerBudget.amount += item.price;
          buyerBudget.history.push({
            type: 'add',
            amount: item.price,
            note: `Anulat: ${item.name} (wishlist ${owner.username})`,
            createdAt: new Date(),
          });
        }
        await buyerBudget.save();
      } catch {
        // best-effort — nu bloca răspunsul principal
      }
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update item.' });
  }
};

// PATCH /api/shared/:shareToken/items/:id/breakdown/:key
const updateSharedBreakdownItem = async (req, res) => {
  try {
    const { purchased, boughtBy } = req.body;
    if (typeof purchased !== 'boolean') {
      return res.status(400).json({ error: 'Field purchased must be a boolean.' });
    }

    const owner = await User.findOne({ shareToken: req.params.shareToken }).select('_id username');
    if (!owner) return res.status(404).json({ error: 'Wishlist not found.' });

    const item = await WishlistItem.findOneAndUpdate(
      { _id: req.params.id, userId: owner._id },
      { $set: { 'breakdown.$[elem].purchased': purchased } },
      {
        arrayFilters: [{ 'elem.key': req.params.key }],
        new: true,
        runValidators: true,
      }
    );

    if (!item) return res.status(404).json({ error: 'Item not found.' });

    const bd = item.breakdown?.find((b) => b.key === req.params.key);

    // Notifică proprietarul când un element din breakdown e cumpărat
    if (purchased && bd) {
      // Prioritate: boughtBy din body → username din token → 'Cineva'
      let buyerName = (typeof boughtBy === 'string' && boughtBy.trim()) ? boughtBy.trim() : null;
      if (!buyerName && req.userId) {
        try {
          const buyer = await User.findById(req.userId).select('username');
          if (buyer) buyerName = buyer.username;
        } catch { /* best-effort */ }
      }
      const displayName = buyerName || 'Cineva';

      await Notification.create({
        userId: owner._id,
        type: 'purchased',
        message: `${displayName} a plătit o parte din "${item.name}".`,
        itemName: item.name,
        boughtBy: buyerName,
      });
    }

    // Ajustează bugetul CUMPĂRĂTORULUI autentificat
    if (req.userId && bd) {
      try {
        const buyerBudget = await getOrCreateBudget(req.userId);
        if (purchased) {
          buyerBudget.amount -= bd.amount;
          buyerBudget.history.push({
            type: 'subtract',
            amount: bd.amount,
            note: `Plătit parte din "${item.name}" (wishlist ${owner.username})`,
            createdAt: new Date(),
          });
        } else {
          buyerBudget.amount += bd.amount;
          buyerBudget.history.push({
            type: 'add',
            amount: bd.amount,
            note: `Anulat parte din "${item.name}" (wishlist ${owner.username})`,
            createdAt: new Date(),
          });
        }
        await buyerBudget.save();
      } catch {
        // best-effort
      }
    }

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update breakdown item.' });
  }
};

module.exports = { getSharedWishlist, updateSharedItem, updateSharedBreakdownItem };
