const express = require('express');
const router = express.Router();

console.log('Ehrekonto: products route loaded');

// create the root product route
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});

router.post('/', (req, res) => {
    res.status(200).json({
        message: 'Handling POST requests to /products'
    });
});

module.exports = router;