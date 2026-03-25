const mongoose = require('mongoose');

const BreakdownItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ['accommodation', 'flights', 'food', 'activities'],
      required: true,
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
    name: {
      type: String,
      required: [true, 'Numele este obligatoriu.'],
      trim: true,
      maxlength: [200, 'Numele nu poate depăși 200 de caractere.'],
    },
    price: {
      type: Number,
      required: [true, 'Prețul este obligatoriu.'],
      min: [0, 'Prețul nu poate fi negativ.'],
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