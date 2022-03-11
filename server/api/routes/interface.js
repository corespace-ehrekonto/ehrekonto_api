const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');
const crypt = require('../../assets/login/crypt');

// Import models
const Key = require('../models/keys');

// Create rate limit
const addLoginLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 500,
  message: "Honor add limit exceeded"
});

console.log('Ehrekonto: Application route loaded');

// Create the root product route
router.get("/", addLoginLimit, (req, res, next) => {
  const routes = {
    "root": {
      "honor": {
        "get": ["all", "user"],
        "post": ["transaction-create"]
      },
      "user": {
        "get": ["all", { "user": ["id", "username"] }],
        "post": ["create-user"],
        "patch": ["update-settings", "update-data"],
        "delete": ["delete-user"]
      }
    }
  }

  res.status(200).json({
    messsage: "This is the management root route for the API.\n With the following routes",
    routes: routes
  });
});

// router.get('/create-key', (req, res, next) => {
//   const apikey = crypt.generateApiKey();
//   res.status(200).json({ apikey: apikey });
// });

// router.post('/validate-key', addLoginLimit, (req, res, next) => {
//   const apikey = req.body.apikey;
//   Key.findByIdAndRemove(apikey).exec()
//     .then(result => {
//       console.log(result);
//       res.status(200).json(result);
//     }).catch(err => {
//       console.log(err);
//       errorHandlerLogger.log(err, req, res, next);
//       res.status(500).json({ error: err })
//     });
// });

module.exports = router;