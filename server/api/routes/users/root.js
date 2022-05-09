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