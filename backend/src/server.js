require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const wishlistRoutes = require('./routes/wishlist');
const budgetRoutes = require('./routes/budget');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/items', wishlistRoutes);
app.use('/api/budget', budgetRoutes);

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