const fs = require('fs');
const path = require('path');

// import custom modules
const projectRoot = require('../utils/getProjectRoot');

const errorHandlerLogger = {};

errorHandlerLogger.log = (error, req, res, next) => {
  const rootDir = projectRoot.getDir();

  // create loggin stream for the api
  const accessLogStream = fs.createWriteStream(path.join(rootDir, 'log', 'error.log'), {
    flags: 'a'
  });

  // log the error
  accessLogStream.write(`${new Date()} - ${req.method} ${req.originalUrl} - ${error.message} - ${error.status || 500}\n`);
};

errorHandlerLogger.error = (error) => {
  const rootDir = projectRoot.getDir();

  // create loggin stream for the api
  const accessLogStream = fs.createWriteStream(path.join(rootDir, 'log', 'error.log'), {
    flags: 'a'
  });

  // log the error
  accessLogStream.write(`${new Date()} - ${error.message} - ${error.status || 500}\n`);
};

module.exports = errorHandlerLogger;