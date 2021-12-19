const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

console.log('Ehrekonto: users route loaded');

// Import models
const User = require('../models/users');

// create the root order route
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

router.post("/", (req, res, next) => {
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        password: req.body.password,
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

router.get('/:userID', (req, res, next) => {
    const id = req.params.userID;
    User.findById(id).exec()
        .then(doc => {
            console.log(doc);
            res.status(200).json(doc);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        });
});

router.get('/user/:username', (req, res, next) => {
    const username = req.params.username;
    User.find({username: username}).exec()
        .then(doc => {
            console.log(doc);
            res.status(200).json(doc);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;