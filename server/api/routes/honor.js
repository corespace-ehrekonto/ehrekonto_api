const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');

// Import models
const Honor = require('../models/honor');

// Create rate limit
const addHonorLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 100,
  message: "Honor add limit exceeded"
});

const requestHonorLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 120,
  message: "Honor request limit exceeded"
});

console.log('Ehrekonto: Honor route loaded');

// Create the root product route
router.get("/", requestHonorLimit, (req, res, next) => {
  Honor.find()
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;