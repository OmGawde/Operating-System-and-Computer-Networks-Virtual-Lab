const router = require('express').Router();
const Flashcard = require('../models/Flashcard');

// GET all flashcards
router.get('/', async (req, res) => {
  try {
    const cards = await Flashcard.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET flashcards by topic
router.get('/:topic', async (req, res) => {
  try {
    const cards = await Flashcard.find({ topic: { $regex: new RegExp(req.params.topic, 'i') } });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
