const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');

console.log('Ehrekonto: orders route loaded');

// Import models
const Order = require('../models/order');
const Product = require('../models/product');

// Create rate limiter
const createOrderLimit = rateLimit({
    windowMs: 60*60*1000, max: 1000,
    message: "Order creation limit exceeded"
});

const listOrderLimit = rateLimit({
    windowMs: 60*60*1000, max: 1000,
    message: "Order list request limit exceeded"
});

// create the root order route
router.get('/', (req, res, next) => {
    Order.find().select('product quantity _id')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.productId,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    }
                }),
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}); 

// create order create route
router.post('/', createOrderLimit, (req, res, next) => {
    let errorStatus = false;
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                errorStatus = true;
                return res.status(404).json({
                    message: "Product not found"
                });
            } else {
                const order = new Order({
                    _id: mongoose.Types.ObjectId(),
                    quantity: req.body.quantity,
                    product: req.body.productId
                });
            
                return order.save();
            }
        })
        .then(result => {
            if (!errorStatus) {
                console.log(result);
                res.status(201).json({
                    message: 'Order has been created',
                    createdOrder: {
                        _id: result._id,
                        product: result.product,
                        quantity: result.quantity
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                });
            }
        })
        .catch(err => {
            console.log(err);
            errorHandlerLogger.log(err, req, res, next);
            if (!errorStatus) {
                res.status(500).json({
                    error: err
                });
            }
        });
});

// create a get specific order route
router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId).exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }
            res.status(200).json({
                order: order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

// create delete order route
router.delete('/:orderId', (req, res, next) => {
    Order.remove({ _id: req.params.orderId }).exec()
        .then(result => {
            res.status(200).json({
                message: 'Order has been removed',
                request: {
                    type: 'POST',
                    url: "http://localhost:3000/orders",
                    body: { productId: "ID", quantity: "Number" }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;