const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  uniqueId: { type: String, default: 'default-user' },
  topic: { type: String, required: true },
  knownCards: { type: Number, default: 0 },
  totalCards: { type: Number, default: 0 }
}, { timestamps: true });

progressSchema.index({ uniqueId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
