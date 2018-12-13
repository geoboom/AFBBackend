const express = require('express');

const {
  reset,
  check,
  redeem
} = require('../controllers/trip');

const router = express.Router();

router.get('/check', check);
router.get('/reset', reset);
router.get('/redeem', redeem);

module.exports = router;
