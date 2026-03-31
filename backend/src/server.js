require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const wishlistRoutes = require('./routes/wishlist');
const budgetRoutes = require('./routes/budget');
const authRoutes = require('./routes/auth');
const sharedRoutes = require('./routes/shared');
const friendsRoutes = require('./routes/friends');
const usersRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', wishlistRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/shared', sharedRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/users', usersRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint negăsit.' });
});

// ── Error handler (trebuie să fie ultimul) ────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server pornit pe http://localhost:${PORT}`);
  });
});