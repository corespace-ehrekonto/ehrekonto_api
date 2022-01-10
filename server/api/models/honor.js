const mongoose = require('mongoose');

const honorSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  UserId: { type: String, required: true },
  HonorAmount: { type: Number, required: true },
  Comment: { type: String, required: false },
});

module.exports = mongoose.model('Honor', honorSchema);