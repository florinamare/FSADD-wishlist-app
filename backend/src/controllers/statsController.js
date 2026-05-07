const mongoose = require('mongoose');
const WishlistItem = require('../models/WishlistItem');
const Friend = require('../models/Friend');
const Notification = require('../models/Notification');

// GET /api/stats
const getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      itemsByPriority,
      spentPerMonth,
      totalItems,
      purchasedItems,
      activeFriends,
      unreadNotifications,
    ] = await Promise.all([
      // Items count + total value grouped by priority
      WishlistItem.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 },
            totalValue: { $sum: '$price' },
            purchasedCount: { $sum: { $cond: ['$purchased', 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Amount spent (purchased items) grouped by year/month, last 6 months
      WishlistItem.aggregate([
        {
          $match: {
            userId,
            purchased: true,
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            totalSpent: { $sum: '$price' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      WishlistItem.countDocuments({ userId: req.userId }),
      WishlistItem.countDocuments({ userId: req.userId, purchased: true }),

      // Friends who visited in the last 30 days
      Friend.countDocuments({ ownerId: req.userId, visitedAt: { $gte: thirtyDaysAgo } }),

      Notification.countDocuments({ userId: req.userId, read: false }),
    ]);

    return res.json({
      summary: {
        totalItems,
        purchasedItems,
        pendingItems: totalItems - purchasedItems,
        activeFriends,
        unreadNotifications,
      },
      itemsByPriority,
      spentPerMonth,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
};

module.exports = { getStats };
