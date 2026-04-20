const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { getProfile, updateProfile, updatePassword } = require('../controllers/profileController');
const {
  updateUsername: updateUsernameSchema,
  updatePassword: updatePasswordSchema,
} = require('../validators/profileSchemas');

router.use(auth);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/', getProfile);

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update username
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username]
 *             properties:
 *               username: { type: string, minLength: 3, maxLength: 50 }
 *     responses:
 *       200:
 *         description: Updated user profile
 *       409:
 *         description: Username already in use
 */
router.patch('/', validate(updateUsernameSchema), updateProfile);

/**
 * @swagger
 * /profile/password:
 *   patch:
 *     summary: Change password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Old password incorrect
 */
router.patch('/password', validate(updatePasswordSchema), updatePassword);

module.exports = router;
