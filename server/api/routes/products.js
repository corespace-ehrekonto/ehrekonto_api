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

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling POST requests to /products'
    });
});

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

router.patch('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Updated product'
    });
});

router.delete('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Removed product'
    });
});

module.exports = router;