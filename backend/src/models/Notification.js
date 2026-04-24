const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['purchased', 'visited'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      default: null,
    },
    boughtBy: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
