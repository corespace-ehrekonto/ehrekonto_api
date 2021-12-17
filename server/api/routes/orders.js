const express = require('express');
const router = express.Router();

console.log('Ehrekonto: orders route loaded');

// create the root order route
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Orders where fetched'
    });
}); 

// create order create route
router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Order was created'
    });
});

// create a get specific order route
router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: 'Order details fetched',
        id: id
    });
});

// create delete order route
router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: 'Order was deleted',
        id: id
    });
});

module.exports = router;