const express = require('express');
const router = express.Router();

console.log('Ehrekonto: orders route loaded');

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Orders where fetched'
    });
}); 

router.post('/', (req, res, next) => {
    res.status(201).json({
        message: 'Order was created'
    });
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: 'Order details fetched',
        id: id
    });
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: 'Order was deleted',
        id: id
    });
});

module.exports = router;