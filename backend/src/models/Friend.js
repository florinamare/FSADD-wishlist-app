const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  ownerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visitorName: { type: String, required: true, maxlength: 50 },
  visitedAt:   { type: Date, default: Date.now },
});

// Un singur document per pereche owner-visitor
friendSchema.index({ ownerId: 1, visitorId: 1 }, { unique: true });

module.exports = mongoose.model('Friend', friendSchema);
