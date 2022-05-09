const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Importing router
const router = express.Router();

// Get Project Root Path
const projectRoot = require('../../../assets/utils/getProjectRoot');
const rootPath = `${projectRoot.getDir()}/server/`;


// Get script name
var scriptName = path.basename(__filename);

// Import custom modules
const errorHandlerLogger = require(`${rootPath}assets/logging/errorHandler`);

// Import models
const Honor = require(`${rootPath}api/models/honors`);

console.log(`Ehrekonto: Honor/${scriptName} route loaded`);

// Create rate limit
const addHonorLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 100,
  message: "Honor add limit exceeded"
});

const requestHonorLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 120,
  message: "Honor request limit exceeded"
});

// Get user honor data
router.get('/u/:userID', requestHonorLimit, (req, res, next) => {
  const id = req.params.userID;
  Honor.find({ IDReceiver: id }).exec()
    .then(docs => {
      transactionsAmount = ((docs.length) - 1);

      let total = 0;
      docs.forEach(doc => {
        total += doc.HonorAmount;
      });

      res.status(200).json({
        honor: total,
        lastHonor: {
          from: docs[transactionsAmount].IDFrom,
          date: docs[transactionsAmount].Date,
        }
      });
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err })
    });
});

module.exports = router;