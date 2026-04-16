const mongoose = require('mongoose');

const BreakdownItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Key cannot exceed 100 characters.'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purchased: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const WishlistItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required.'],
      index: true,
    },
    wishlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wishlist',
      index: true,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    boughtBy: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, 'boughtBy cannot exceed 100 characters.'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    breakdown: {
      type: [BreakdownItemSchema],
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('WishlistItem', WishlistItemSchema);
