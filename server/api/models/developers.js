const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  uuid: { type: String, required: true },
  email: { type: String, required: true },
  applicationName: { type: String, required: true },
  applicationDescription: { type: String, required: false },
  apiKey: { type: String, required: false },
  apiKeyExpiration: { type: Date, required: false },
  apiKeyLastUsed: { type: Date, default: Date.now },
  apiKeyLastUsedIP: { type: String, required: false },
  apiKeyBlocked: { type: Boolean, default: false },
  rateLimit: { type: Number, default: 100 },
});

module.exports = mongoose.model('Developer', developerSchema);