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

module.exports = router;