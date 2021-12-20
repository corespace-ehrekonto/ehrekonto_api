const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');

// Import models
const Product = require('../models/product');

// Create rate limit
const createProductLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 100,
  message: "Product creation limit exceeded"
});

const requestProductsLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 120,
  message: "Product request limit exceeded"
});

console.log('Ehrekonto: products route loaded');

// Create the root product route
router.get("/", requestProductsLimit, (req, res, next) => {
  Product.find()
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({
        error: err
      });
    });
});

// Create the product route
router.post("/", createProductLimit, (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  product.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Handling POST requests to /products",
        createdProduct: result
      });
    })
    .catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({
        error: err
      });
    });
});

// Create a get specific product route
router.get('/:productId', requestProductsLimit, (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id).exec()
    .then(doc => {
      console.log(doc);
      res.status(200).json(doc);
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err })
    });
});

// Create update product route
router.patch('/:productId', createProductLimit, (req, res, next) => {
  const id = req.params.productId;
  const reqBody = req.body;
  const updateOps = {};

  for (const ops of reqBody) {
    updateOps[ops.propName] = ops.value;
  }

  Product.updateMany({ _id: id }, { $set: updateOps }).exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({
        error: err
      });
    });
});

// Create delete product route
router.delete('/:productId', createProductLimit, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id }).exec().then(result => {
    res.status(200).json(result);
  }).catch(err => {
    console.log(err);
    errorHandlerLogger.log(err, req, res, next);
    res.status(500).json({
      error: err
    });
  });
});

module.exports = router;