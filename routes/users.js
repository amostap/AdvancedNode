const express = require('express');
const User = require('../models/user').User;
const ObjectID = require('mongodb').ObjectID;

const router = express.Router();

router.get('/', (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
});

router.get('/:id', (req, res, next) => {
  let id = '';
  try {
    id = new ObjectID(req.params.id);
  } catch (e) {
    next(404);
    return;
  }
  User.findById(id, (err, user) => {
    if (err) return next(err);
    if (!user) return next(404);
    res.json(user);
  });
});

module.exports = router;
