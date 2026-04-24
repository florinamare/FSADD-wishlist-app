require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlist');
const wishlistsRoutes = require('./routes/wishlists');
const budgetRoutes = require('./routes/budget');
const sharedRoutes = require('./routes/shared');
const friendsRoutes = require('./routes/friends');
const usersRoutes = require('./routes/users');
const notificationsRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const statsRoutes = require('./routes/stats');

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 3000;

// ── Security ──────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting (auth routes only) ──────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// ── Logging ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json());

// ── Static uploads ────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Swagger docs ──────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Budget Wishlist API Docs',
}));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/items', wishlistRoutes);
app.use('/api/wishlists', wishlistsRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start (only when run directly) ───────────────────────────
if (require.main === module) {
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Swagger docs at http://localhost:${PORT}/api/docs`);
    });
  });
}

module.exports = { app, httpServer };
