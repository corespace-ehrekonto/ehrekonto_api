const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rfs = require('rotating-file-stream');
const rateLimit = require('express-rate-limit');

// Import custom modules
const projectRoot = require('./assets/utils/getProjectRoot');
const errorHandlerLogger = require('./assets/logging/errorHandler');
const dbc = require('./assets/database/dbconnect');

// Create rate limit
const generalApiLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 5000,
  message: "General Api request limit exceeded"
});

const rootLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 50,
  message: "Root request limit exceeded"
});

// Initialize the api handler
const app = express();
dotenv.config();

// Create loggin stream for the api
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(projectRoot.getDir(), 'log')
});
app.use(morgan('combined', { stream: accessLogStream }))
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);
  res.header('Access-Control-Allow-Headers', process.env.ALLOWED_HEADERS);
  res.header('Access-Control-Allow-Methods', process.env.ALLOWED_METHODS_X);

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', process.env.ALLOWED_METHODS);
    return res.status(200).json({});
  }
  next();
});

// Loading all available routes
const routes = fs.readdirSync(path.join(__dirname, 'api/routes'));
routes.forEach(route => {
  const routePath = path.join(__dirname, 'api/routes', route);
  const routeName = route.replace('.js', '');
  const routeHandler = require(routePath);
  app.use(`/${routeName}`, generalApiLimit, routeHandler);
});

// // Create mongoose db connection
dbc.mongo_connect();

// Handle 404 error
app.use(rootLimit, (req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  next(err);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      status: (error.status || 500)
    }
  });
  errorHandlerLogger.log(error, req, res, next);
});

// Export the api handler
module.exports = app;