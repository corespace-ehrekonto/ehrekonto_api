const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Importing router
const router = express.Router();

// Import custom modules
const projectRoot = require('../../../assets/utils/getProjectRoot');

// Get script name
var scriptName = path.basename(__filename);

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

const requestLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 120,
  message: "Data request limit exceeded"
});

/**
  * Logging in a user
  * @param {String} The username of the user
  * @param {String} The password of the user
  */
router.post('/login', requestLimit, async (req, res, next) => {
  // Check if all fields are present
  if (!req.body.username) { res.status(400).json({ message: 'Username is required' }); return; }
  if (!req.body.password) { res.status(400).json({ message: 'Password is required' }); return; }

  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  // Check if the user exists in the database
  // Return error if not found
  User.findOne({ username: username }).exec()
    .then(user => {
      if (!user) { return res.status(401).json({ message: 'User does not exist' }); }
      if (user.loginToken) { return res.status(401).json({ message: 'User is already logged in' }); }

      // Checking the provided password against the hashed password in the database
      if (crypt.compare(password, user.password)) {
        let loginToken = crypt.generateLoginToken(username);

        if (username == "testuser") {
          const loginToken = "testtoken_3478926487238";
        }

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

module.exports = router;