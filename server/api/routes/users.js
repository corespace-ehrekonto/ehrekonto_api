const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Import custom modules
const errorHandlerLogger = require('../../assets/logging/errorHandler');
const passCrypt = require('../../assets/login/passCrypt');

console.log('Ehrekonto: users route loaded');

// Import models
const User = require('../models/users');

// Get all users currently in the database
router.get("/", (req, res, next) => {
    User.find()
      .exec()
      .then(docs => {
        console.log(docs);
        res.status(200).json(docs);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
});

// Create a new user using the schema
router.post("/", (req, res, next) => {
  const password = passCrypt.encrypt(req.body.password);
  const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      password: password,
      email: req.body.email
  });

  user.save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Handling POST requests to /products",
        createdProduct: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Get user via id
router.get('/:userID', (req, res, next) => {
    const id = req.params.userID;
    User.findById(id).exec()
        .then(doc => {
            console.log(doc);
            res.status(200).json(doc);
        }).catch(err => {
            console.log(err);
            errorHandlerLogger.log(err, req, res, next);
            res.status(500).json({ error: err })
        });
});

// Get user via username
router.get('/user/:username', (req, res, next) => {
    const username = req.params.username;
    User.find({username: username}).exec()
        .then(doc => {
            console.log(doc);
            res.status(200).json(doc);
        }).catch(err => {
            console.log(err);
            errorHandlerLogger.log(err, req, res, next);
            res.status(500).json({ error: err });
        });
});

module.exports = router;