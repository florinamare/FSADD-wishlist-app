const mongoose = require('mongoose');

const BudgetAdjustmentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['add', 'subtract'], required: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  amount: { type: Number, default: 5000 },
  history: { type: [BudgetAdjustmentSchema], default: [] },
});

module.exports = mongoose.model('Budget', BudgetSchema);
