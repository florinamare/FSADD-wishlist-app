const Friend = require('../models/Friend');
const User = require('../models/User');
const WishlistItem = require('../models/WishlistItem');

// POST /api/friends
const addFriend = async (req, res) => {
  try {
    const { shareToken } = req.body;
    if (!shareToken) return res.status(400).json({ error: 'shareToken is required.' });

    const target = await User.findOne({ shareToken }).select('_id username');
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (String(target._id) === String(req.userId)) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend.' });
    }

    await Friend.findOneAndUpdate(
      { ownerId: req.userId, visitorId: target._id },
      { visitorName: target.username, visitedAt: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add friend.' });
  }
};

// GET /api/friends
const getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({ ownerId: req.userId }).sort({ visitedAt: -1 });

    const result = await Promise.all(
      friends.map(async (friend) => {
        const [hasNewItems, visitor] = await Promise.all([
          WishlistItem.exists({
            userId: req.userId,
            createdAt: { $gt: friend.visitedAt },
          }),
          User.findById(friend.visitorId).select('shareToken').lean(),
        ]);

        return {
          visitorId:   friend.visitorId,
          visitorName: friend.visitorName,
          visitedAt:   friend.visitedAt,
          hasNewItems: !!hasNewItems,
          shareToken:  visitor?.shareToken ?? null,
        };
      })
    );

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve friends.' });
  }
};

module.exports = { addFriend, getFriends };
