const fs = require('fs');
const path = require('path');
const express = require('express');

// Initialize the api handler
const app = express();

// Loading all available routes
const productRoutes = require('./api/routes/products');

// Loading all available middlewares
app.use('/products', productRoutes);

// Export the api handler
module.exports = app;