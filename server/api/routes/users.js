const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');
const validatePassword = require('../../assets/login/validatePassword');
const passCrypt = require('../../assets/login/passCrypt');

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

console.log('Ehrekonto: users route loaded');

// Get all users currently in the database
router.get("/", requestLimit, (req, res, next) => {
  User.find()
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Create a new user using the schema
router.post("/", accountCreationLimit, (req, res, next) => {
  if (validatePassword.passwordStrength(req.body.password) < 20) {
    res.status(400).json({
      message: "Password is not strong enough"
    });
  } else {
    const password = passCrypt.encrypt(req.body.password);
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      password: password,
      email: req.body.email
    });

    user.save()
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Handling POST requests to /products",
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

// Get user via id
router.get('/:userId', requestLimit, (req, res, next) => {
  const id = req.params.userId;
  User.findById(id).exec()
    .then(doc => {
      console.log(doc);
      res.status(200).json(doc);
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err })
    });
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

// Get user via username
router.get('/user/:username', requestLimit, (req, res, next) => {
  const username = req.params.username;
  User.find({ username: username }).exec()
    .then(doc => {
      console.log(doc);
      res.status(200).json(doc);
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err });
    });
});

module.exports = router;