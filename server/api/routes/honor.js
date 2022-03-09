const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');

// Import models
const Honor = require('../models/honor');

// Create rate limit
const addHonorLimit = rateLimit({
  windowMs: 60 * 60 * 1000, max: 100,
  message: "Honor add limit exceeded"
});

const requestHonorLimit = rateLimit({
  windowMs: 5 * 60 * 1000, max: 120,
  message: "Honor request limit exceeded"
});

console.log('Ehrekonto: Honor route loaded');

// Create the root product route
router.get("/", requestHonorLimit, (req, res, next) => {
  Honor.find()
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

router.post("/", addHonorLimit, (req, res, next) => {
  const honor = new Honor({
    _id: mongoose.Types.ObjectId(),
    IDFrom: req.body.IDSender,
    IDTo: req.body.IDReceiver,
    HonorAmount: req.body.Amount,
    Comment: req.body.Comment
  });

  honor
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Honor added successfully"
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

router.get('/u/:userID', requestHonorLimit, (req, res, next) => {
  const id = req.params.userID;
  Honor.find({ IDReceiver: id }).exec()
    .then(docs => {
      transactionsAmount = ((docs.length) - 1);

      let total = 0;
      docs.forEach(doc => {
        total += doc.HonorAmount;
      });

      res.status(200).json({
        honor: total,
        lastHonor: {
          from: docs[transactionsAmount].IDFrom,
          date: docs[transactionsAmount].Date,
        }
      });
    }).catch(err => {
      console.log(err);
      errorHandlerLogger.log(err, req, res, next);
      res.status(500).json({ error: err })
    });
});

module.exports = router;