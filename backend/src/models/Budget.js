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
  amount: { type: Number, default: 5000, min: 0 },
  history: { type: [BudgetAdjustmentSchema], default: [] },
});

module.exports = mongoose.model('Budget', BudgetSchema);
