const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');
const validator = require('../../assets/login/validator');
const crypt = require('../../assets/login/crypt');

// Import models
// const Honor = require('../models/honors');
const Developer = require('../models/developers');
const Users = require('../models/users');

console.log('Ehrekonto: Developer route loaded');

// Create the root product route
router.get("/:userId", (req, res, next) => {
  Developer.findOne({ uuid: req.params.userId }).exec()
    .then(doc => {
      res.status(200).json(doc);
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err });
    });
});

module.exports = router;