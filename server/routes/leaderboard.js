const router = require('express').Router();
const Leaderboard = require('../models/Leaderboard');

// Get top 50 scores
router.get('/', async (req, res) => {
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

// Submit a new score
router.post('/', async (req, res) => {
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
    
    // Check rank
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

module.exports = router;
