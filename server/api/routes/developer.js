const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');
const validator = require('../../assets/login/validator');

// Import models
// const Honor = require('../models/honors');
const Developer = require('../models/developers');

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

router.post("/register/:userId", (req, res, next) => {
  let validation = {
    uuid: false,
    developer: false
  };
  let issue = '';

  // if (validator.checkUUid(req.body.userId)) { validation.uuid = true } else { issue = 'UUID is not registered' };
  // if (validator.checkForDeveloper(req.body.userId)) { validation.developer = true } else { issue = 'Developer account is already active' };

  const validationUUid = validator.checkUUid(req.params.userId);
  const validationDeveloper = validator.checkForDeveloper(req.params.userId);

  res.status(200).json({
    validationUUID: validationUUid,
    validationDeveloper: validationDeveloper
  });

});

module.exports = router;