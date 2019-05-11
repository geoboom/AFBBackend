const express = require('express');

const auth = require('./authentication');
const trips = require('./trips');
const tickets = require('./tickets');

const router = express.Router();

router.use('/auth', auth);
router.use('/trips', trips);
router.use('/tickets', tickets);

module.exports = router;
