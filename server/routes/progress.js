const router = require('express').Router();
const Progress = require('../models/Progress');

// GET all progress
router.get('/', async (req, res) => {
  try {
    const progress = await Progress.find();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update progress
router.post('/', async (req, res) => {
  try {
    const { topic, knownCards, totalCards, uniqueId } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { uniqueId: uniqueId || 'default-user', topic },
      { knownCards, totalCards },
      { upsert: true, new: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
