const express = require('express');

const {
  loginPost,
} = require('../controllers/authentication');

const router = express.Router();

router.post('/login', loginPost);

module.exports = router;
