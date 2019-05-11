const express = require('express');
const passport = require('passport');

const {
  approveTicket,
  getCurrentTripDate,
  deleteAllTrips,
  getTrips,
  getCurrentTrips,
  initializeTrips,
  setTripStatus,
  addAdditionalTrip,
} = require('../controllers/trips');

const router = express.Router();

const routerGets = [
  { route: '/getCurrentTripDate', method: getCurrentTripDate },
  { route: '/deleteAllTrips', method: deleteAllTrips },
  { route: '/getTrips', method: getTrips },
  { route: '/getCurrentTrips', method: getCurrentTrips },
];

const routerPosts = [
  { route: '/approveTicket', method: approveTicket },
  { route: '/initializeTrips', method: initializeTrips },
  { route: '/setStatus', method: setTripStatus },
  { route: '/addAdditional', method: addAdditionalTrip },
];

routerGets.forEach(({ route, method }) => {
  router.get(route, passport.authenticate('jwt', { session: false }), method);
});

routerPosts.forEach(({ route, method }) => {
  router.post(route, passport.authenticate('jwt', { session: false }), method);
});

module.exports = router;
