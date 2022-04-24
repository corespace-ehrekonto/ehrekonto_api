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
const dataFilter = require('../../assets/utils/dataFilter');

// Import models
const User = require('../models/users');

// Import protected config
const protectConfig = fs.readFileSync(path.resolve(__dirname, '../../assets/configs/protected.json'));
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

router.get("/", requestLimit, (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      errorHandlerLogger.logError(err);
      res.status(500).send(err);
    } else {

      // Remove password from the user object before sending it to the client and make sure it's not sent back to the client
      const userData = dataFilter.getUsers(users, "default");
      res.send(userData);
    }
  });
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
  const validPassword = await validator.validatePassword(req.body.password);
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

/**
  * Logging in a user
  * @param {String} The username of the user
  * @param {String} The password of the user
  */
router.post('/login', requestLimit, async (req, res, next) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  // Check if all fields are present
  if (!username) { return res.status(400).json({ message: 'Username is required' }); }
  if (!password) { return res.status(400).json({ message: 'Password is required' }); }

  // Check if the user exists in the database
  // Return error if not found
  User.findOne({ username: username }).exec()
    .then(user => {
      if (!user) { return res.status(401).json({ message: 'User does not exist' }); }
      if (user.loginToken) { return res.status(401).json({ message: 'User is already logged in' }); }

      // Checking the provided password against the hashed password in the database
      if (crypt.compare(password, user.password)) {
        const loginToken = crypt.generateLoginToken(username);

        // If the password was correct the user is logged in
        // LoginToken is generated, returned to the user and stored in the database
        User.findOneAndUpdate({ username: username }, { loginToken: loginToken, lastLogin: Date.now() }, { new: false }).exec()
          .then(user => {

            // Respond to user with a success message and the login token
            res.status(200).json({
              message: 'Authentication successful',
              user: username,
              token: loginToken
            });
          })
          .catch(err => {
            console.log(err);
            errorHandlerLogger.log(err, req, res, next);
            res.status(500).json({ error: err });
          });
      } else {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err });
    });
});

/**
  * Logging out a user
  * @param {String} The username of the user
  * @param {String} The login token of the user
  */
router.post('/logout', requestLimit, (req, res, next) => {
  // check if the user is logged in and has a loginToken
  if (!req.body.username) { return res.status(400).json({ message: 'Username is required' }); }
  if (!req.body.loginToken) { return res.status(400).json({ message: 'Login token is required' }); }

  // use $unset to remove the loginToken from the user in the database and return a success message
  User.findOneAndUpdate({ username: req.body.username, loginToken: req.body.loginToken }, { $unset: { loginToken: "" } }, { new: false }).exec()
    .then(user => {
      if (!user) { return res.status(401).json({ message: 'Session is not valid' }); }

      res.status(200).json({
        message: 'Logout successful',
        lastLogin: user.lastLogin
      });
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err });
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