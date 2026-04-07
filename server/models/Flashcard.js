const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  topic: { type: String, required: true, index: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
