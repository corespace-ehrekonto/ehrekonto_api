const fs = require('fs');
const rfs = require('rotating-file-stream');
const path = require('path');
const morgan = require('morgan');
const express = require('express');

// import custom modules
const projectRoot = require('./assets/utils/getProjectRoot');
const errorHandlerLogger = require('./assets/logging/errorHandler');

// Initialize the api handler
const app = express();

// create loggin stream for the api
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(projectRoot.getDir(), 'log')
});
app.use(morgan('combined', { stream: accessLogStream }))

// Loading all available routes
const routes = fs.readdirSync(path.join(__dirname, 'api/routes'));
routes.forEach(route => {
    const routePath = path.join(__dirname, 'api/routes', route);
    const routeName = route.replace('.js', '');
    const routeHandler = require(routePath);
    app.use(`/${routeName}`, routeHandler);
});

// handle 404 error
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status(404);
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