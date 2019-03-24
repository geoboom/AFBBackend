const express = require('express');

const {
  getTrips,
  initializeTrips,
  setTripStatus,
} = require('../controllers/trip');

const router = express.Router();

router.get('/', getTrips);
router.post('/initialize', initializeTrips);
router.post('/setStatus', setTripStatus);

module.exports = router;
