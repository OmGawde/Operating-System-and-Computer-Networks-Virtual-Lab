const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kinetic-network';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected to:', MONGODB_URI))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 Kinetic Network API is running.' });
});
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Routes
try {
  const flashcardRoutes = require('./routes/flashcards');
  app.use('/api/flashcards', flashcardRoutes);
  console.log('  ✓ /api/flashcards routes loaded');
} catch (err) {
  console.error('  ✗ Failed to load flashcard routes:', err.message);
}

try {
  const progressRoutes = require('./routes/progress');
  app.use('/api/progress', progressRoutes);
  console.log('  ✓ /api/progress routes loaded');
} catch (err) {
  console.error('  ✗ Failed to load progress routes:', err.message);
}

// ── Leaderboard routes (inlined to bypass Express v5 Router mounting issue) ──
const Leaderboard = require('./models/Leaderboard');

// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const scores = await Leaderboard.find()
      .sort({ score: -1, accuracy: -1, date: 1 })
      .limit(50);
    res.json(scores);
  } catch (err) {
    console.error('Leaderboard GET error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST leaderboard
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { nickname, score, totalPossible } = req.body;
    
    if (!nickname || typeof score !== 'number') {
      return res.status(400).json({ error: 'Nickname and score are required' });
    }

    const accuracy = totalPossible ? Math.round((score / totalPossible) * 100) : 0;

    const newEntry = new Leaderboard({
      nickname,
      score,
      totalPossible: totalPossible || 0,
      accuracy
    });

    const savedEntry = await newEntry.save();
    console.log('✓ Leaderboard entry saved:', savedEntry.nickname, savedEntry.score);
    
    const rank = await Leaderboard.countDocuments({
      $or: [
        { score: { $gt: score } },
        { score: score, accuracy: { $gt: accuracy } },
        { score: score, accuracy: accuracy, date: { $lt: savedEntry.date } }
      ]
    }) + 1;

    res.status(201).json({ entry: savedEntry, rank });
  } catch (err) {
    console.error('Leaderboard POST error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

console.log('  ✓ /api/leaderboard routes loaded (inline)');

app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
});
