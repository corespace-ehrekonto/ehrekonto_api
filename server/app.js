const fs = require('fs');
const path = require('path');
const express = require('express');

// Initialize the api handler
const app = express();

// Loading all available routes
const productRoutes = require('./api/routes/products');

// Loading all available middlewares
app.use('/products', productRoutes);

// 
app.use((req, res, next) => {
    res.status(200).json({
        message: 'It works!'
    });
});

// Export the api handler
module.exports = app;