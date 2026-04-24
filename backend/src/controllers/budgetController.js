const Budget = require('../models/Budget');

const getOrCreate = async (userId) => {
  let budget = await Budget.findOne({ userId });
  if (!budget) {
    budget = await Budget.create({ userId, amount: 5000, history: [] });
  }
  return budget;
};

/**
 * @swagger
 * /budget:
 *   get:
 *     summary: Get the authenticated user's budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget data
 */
const getBudget = async (req, res) => {
  try {
    const budget = await getOrCreate(req.userId);
    return res.json({ amount: budget.amount, history: budget.history });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve budget.' });
  }
};

/**
 * @swagger
 * /budget:
 *   patch:
 *     summary: Adjust the authenticated user's budget
 *     tags: [Budget]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               type: { type: string, enum: [add, subtract] }
 *               amount: { type: number, minimum: 0.01 }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Updated budget
 */
const adjustBudget = async (req, res) => {
  try {
    const { type, amount, note } = req.body;

    const budget = await getOrCreate(req.userId);

    if (type === 'subtract' && amount > budget.amount) {
      return res.status(400).json({ error: 'Cannot subtract more than the total budget.' });
    }

    const delta = type === 'add' ? amount : -amount;
    budget.amount += delta;
    budget.history.push({ type, amount, note: note || '', createdAt: new Date() });
    await budget.save();

    return res.json({ amount: budget.amount, history: budget.history });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to adjust budget.' });
  }
};

module.exports = { getBudget, adjustBudget, getOrCreate };
