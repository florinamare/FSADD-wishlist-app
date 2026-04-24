const bcrypt = require('bcrypt');
const User = require('../models/User');

const SALT_ROUNDS = 10;

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// PATCH /api/profile
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Field username is required.' });
    }

    const existing = await User.findOne({ username, _id: { $ne: req.userId } });
    if (existing) {
      return res.status(409).json({ error: 'Username already in use.' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username },
      { new: true, runValidators: true }
    ).select('-passwordHash').lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// PATCH /api/profile/password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Fields oldPassword and newPassword are required.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const match = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Old password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
};

module.exports = { getProfile, updateProfile, updatePassword };
