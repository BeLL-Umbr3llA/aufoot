const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  originalId: { type: String, unique: true, required: true },
  title: String,
  content: String,
  imageUrl: String,
  type: { type: String, enum: ['news', 'preview', 'analysis'] },
  status: { type: String, enum: ['pending', 'posted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
