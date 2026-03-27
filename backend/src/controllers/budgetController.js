const Budget = require('../models/Budget');

const getOrCreate = async () => {
  let budget = await Budget.findOne();
  if (!budget) {
    budget = await Budget.create({ amount: 5000, history: [] });
  }
  return budget;
};

// GET /api/budget
const getBudget = async (req, res) => {
  try {
    const budget = await getOrCreate();
    res.json({ amount: budget.amount, history: budget.history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve budget.' });
  }
};

// PATCH /api/budget
const adjustBudget = async (req, res) => {
  try {
    const { type, amount, note } = req.body;

    if (!['add', 'subtract'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Accepted: add, subtract.' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const budget = await getOrCreate();

    if (type === 'subtract' && amount > budget.amount) {
      return res.status(400).json({ error: 'Cannot subtract more than the total budget.' });
    }

    const delta = type === 'add' ? amount : -amount;
    budget.amount += delta;
    budget.history.push({ type, amount, note: note || '', createdAt: new Date() });
    await budget.save();

    res.json({ amount: budget.amount, history: budget.history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to adjust budget.' });
  }
};

module.exports = { getBudget, adjustBudget };
