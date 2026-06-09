const User = require('../models/User');

// GET /api/users/search?q=...
const searchUsers = async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 3) {
    return res.status(400).json({ error: 'Query must be at least 3 characters.' });
  }

  try {
    const users = await User.find({
      _id: { $ne: req.userId },
      username: { $regex: q, $options: 'i' },
    })
      .select('username shareToken')
      .limit(20)
      .lean();

    return res.json(users.map((u) => ({ username: u.username, shareToken: u.shareToken })));
  } catch (err) {
    return res.status(500).json({ error: 'Search failed.' });
  }
};

module.exports = { searchUsers };
