const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');
const validator = require('../../assets/login/validator');
const crypt = require('../../assets/login/crypt');

// Import models
const User = require('../models/users');

// Import protected config
const protectConfig = fs.readFileSync(path.resolve(__dirname, '../configs/protected.json'));
// console.log(__dirname);

// Create rate limit
const accountCreationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: "Account creation limit exceeded"
});

const requestLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 120,
  message: "Data request limit exceeded"
});

console.log('Ehrekonto: Users route loaded');

/**
  * Register a new user
  * @param {String} The username of the user
  * @param {String} The password of the user
  * @param {String} The email of the user 
  */
router.post("/register", accountCreationLimit, async (req, res, next) => {
  let validation = {
    password: false,
    email: false,
    username: false
  };

  let issue = '';

  // Check if all fields are present
  if (!req.body.username) { res.status(400).json({ message: 'Username is required' }); return; }
  if (!req.body.email) { res.status(400).json({ message: 'Email is required' }); return; }
  if (!req.body.password) { res.status(400).json({ message: 'Password is required' }); return; }

  // Checking fields for validity
  if (validator.existsUsername(req.body.username)) { validation.username = true; } else { issue = 'Username already exists' };
  if (validator.existsEmail(req.body.email)) { validation.email = true } else { issue = 'Email already exists' };
  if (validator.validateUsername(req.body.username)) { validation.username = true } else { issue = 'Username is invalid' };
  if (validator.validateEmail(req.body.email)) { validation.email = true } else { issue = 'Email is invalid' };
  if (validator.passwordStrength(req.body.password) >= 20) { validation.password = true } else { issue = 'Password strength is too low' };

  console.log(validation);

  // If all fields are valid, create a new user otherwise return an error
  if (!validation.password || !validation.email || !validation.username) {
    res.status(400).json({
      message: 'Validation failed',
      issue: issue
    });
  } else {
    // Hashing the password
    const password = crypt.encrypt(req.body.password);

    // Creating new user object
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username.toLowerCase(),
      password: password,
      email: req.body.email
    });

    // Saving the new user to the database
    user.save()
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Handling POST requests to /users",
          createdProduct: result
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  }
});

// Update user via id and given fields
router.patch('/:userId', requestLimit, (req, res, next) => {
  const id = req.params.userId;
  const protect = JSON.parse(protectConfig).users;
  const reqBody = req.body;
  const updateOps = {};

  for (const ops of reqBody) {
    updateOps[ops.propName] = ops.value;
  }

  // Check if updateOps has one or more matches with the protected fields
  for (const ops of protect) {
    if (updateOps.hasOwnProperty(ops)) {
      errorHandlerLogger.log({ message: `${ops} is a protected field`, status: 500 }, req, res, next);
      res.status(500).json({
        error: `Cannot update ${ops}`,
        message: `${ops} is a protected field`
      });
      return;
    }
  }

  // Add updateAt field to updateOps object if it doesn't exist, and set it to the current date
  if (!updateOps.hasOwnProperty('updateAt')) {
    updateOps.updateAt = new Date();
  } else {
    updateOps.updateAt = new Date(updateOps.updateAt);
  }

  User.findByIdAndUpdate(id, { $set: updateOps }, { new: true }).exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err })
    });
});

router.delete('/:userId', requestLimit, (req, res, next) => {
  const id = req.params.userId;
  User.findByIdAndRemove(id).exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err })
    });
});

module.exports = router;