const fs = require('fs');
const path = require('path');
const express = require('express');

// Initialize the api handler
const app = express();

// Loading all available routes
const routes = fs.readdirSync(path.join(__dirname, 'api/routes'));
routes.forEach(route => {
    const routePath = path.join(__dirname, 'api/routes', route);
    const routeName = route.replace('.js', '');
    const routeHandler = require(routePath);
    app.use(`/${routeName}`, routeHandler);
});

// Export the api handler
module.exports = app;