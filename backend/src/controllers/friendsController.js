const Friend = require('../models/Friend');
const WishlistItem = require('../models/WishlistItem');

// GET /api/friends
const getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({ ownerId: req.userId }).sort({ visitedAt: -1 });

    const result = await Promise.all(
      friends.map(async (friend) => {
        const hasNewItems = await WishlistItem.exists({
          userId: req.userId,
          createdAt: { $gt: friend.visitedAt },
        });

        return {
          visitorId:   friend.visitorId,
          visitorName: friend.visitorName,
          visitedAt:   friend.visitedAt,
          hasNewItems: !!hasNewItems,
        };
      })
    );

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve friends.' });
  }
};

module.exports = { getFriends };
