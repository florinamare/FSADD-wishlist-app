const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getStats } = require('../controllers/statsController');

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get aggregated statistics for the authenticated user
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 */
router.get('/', auth, getStats);

module.exports = router;
