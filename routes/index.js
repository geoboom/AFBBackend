const express = require('express');

const auth = require('./authentication');
const trips = require('./trips');

const router = express.Router();

router.use('/auth', auth);
router.use('/trips', trips);

module.exports = router;
