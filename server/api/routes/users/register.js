const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Importing router
const router = express.Router();

// Get script name
var scriptName = path.basename(__filename);

// Import custom modules
const projectRoot = require('../../../assets/utils/getProjectRoot');

// var init
const rootPath = `${projectRoot.getDir()}/server/`;

const errorHandlerLogger = require(`${rootPath}assets/logging/errorHandler`);
const validator = require(`${rootPath}assets/login/validator`);
const crypt = require(`${rootPath}assets/login/crypt`);
const dataFilter = require(`${rootPath}assets/utils/dataFilter`);
const dataHandler = require(`${rootPath}assets/utils/dataHandler`);

// Import models
const User = require('../../models/users');

console.log(`Ehrekonto: Users/${scriptName} route loaded`);

// Create rate limit
const accountCreationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: "Account creation limit exceeded"
});

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

  const existUsername = await validator.existsUsername(req.body.username);
  const existEmail = await validator.existsEmail(req.body.email);
  const validPassword = await validator.passwordStrength(req.body.password);
  const validUsername = await validator.validateUsername(req.body.username);
  const validEmail = await validator.validateEmail(req.body.email);

  // Checking fields for validity
  if (validUsername) { validation.username = true } else { validation.username = false; issue = 'Username is invalid' };
  if (validEmail) { validation.email = true } else { validation.email = false; issue = 'Email is invalid' };
  if (!existEmail) { validation.email = true } else { validation.email = false; issue = 'Email already exists' };
  if (!existUsername) { validation.username = true; } else { validation.username = false; issue = 'Username already exists' };
  if (validPassword >= 20) { validation.password = true } else { validation.password = false; issue = 'Password strength is too low' };

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


module.exports = router;