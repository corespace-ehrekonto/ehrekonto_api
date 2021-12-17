const express = require('express');
const res = require('express/lib/response');
const router = express.Router();

console.log('Ehrekonto: products route loaded');

// create the root product route
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});

// create the product route
router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Handling POST requests to /products'
    });
});

// create a get specific product route
router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    if (id === 'test') {
        res.status(200).json({
            message: 'Testing route for product id',
            id: id
        });
    } else {
        res.status(200).json({
            message: "Handler doesn't support this product id",
        });
    }
});

// create update product route
router.patch('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Updated product'
    });
});

// create delete product route
router.delete('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Removed product'
    });
});

module.exports = router;