// item schema

const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priority: {
    type: Number,
    default: 1 // 1 low, 2 medium, 3 high
  },
  purchased: {
    type: Boolean,
    default: false
  },
  breakdown: {
    accommodation: Number,
    flights: Number,
    food: Number,
    activities: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);