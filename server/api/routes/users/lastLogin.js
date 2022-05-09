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
  * Request last Login timestamp
  * @param {string} username
  * @param {string} loginToken
  * @return {object}
 */
router.post("/lastLogin", requestLimit, async (req, res) => {
  const username = req.body.username;
  const loginToken = req.body.loginToken;

  // Request the user data from the database
  const user = await User.findOne({ username: username });

  // Check if the loginToken is valid
  // Send the last login timestamp to the client
  if (user.loginToken === loginToken) {
    const timestamp = await dataHandler.getLastLogin(user);
    res.send({ lastLogin: timestamp });
  } else {
    // Send an error message to the client
    res.send({ error: "Invalid credentials" });
  }
});

module.exports = router;