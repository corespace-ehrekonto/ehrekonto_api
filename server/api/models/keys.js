const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  application: { type: String, required: true },
  key: { type: String, required: true },
});

module.exports = mongoose.model('Key', keySchema);