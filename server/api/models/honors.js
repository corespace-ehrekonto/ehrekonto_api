const mongoose = require('mongoose');

const honorSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  IDFrom: { type: String, required: true },
  IDTo: { type: String, required: true },
  HonorAmount: { type: Number, required: true },
  Comment: { type: String, required: false },
  Date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Honor', honorSchema);