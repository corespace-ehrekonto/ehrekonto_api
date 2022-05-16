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

// Import limit config
const rootLimit = JSON.parse(fs.readFileSync(`${rootPath}assets/configs/rates/users.json`));
const limit = rootLimit["root"].limit || 20;
const time = rootLimit["root"].time || 60;
const message = rootLimit["root"].message || "Limit exceeded"

console.log(`Ehrekonto: Infos/${scriptName} route loaded`);

// Create rate limit
const requestLimit = rateLimit({
  windowMs: 1000 * time, max: limit,
  message: message
});

router.get("/", requestLimit, (req, res) => {
  res.sendStatus(404, "Route not found");
});

module.exports = router;