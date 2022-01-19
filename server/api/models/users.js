const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, required: false },
  img: { type: String, required: false },
});

module.exports = mongoose.model('User', userSchema);