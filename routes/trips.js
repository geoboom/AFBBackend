const express = require('express');
const passport = require('passport');

const {
  getDriverTripHistory,
  approveTicket,
  getCurrentTrip,
  getCurrentTripDate,
  deleteTrips,
  getTrips,
  getCurrentTrips,
  getAdditionalPassengers,
  initializeTrips,
  setTripStatus,
  addAdditionalTrip,
} = require('../controllers/trips');

const router = express.Router();

const routerGets = [
  { route: '/my-history', method: getDriverTripHistory },
  { route: '/active', method: getCurrentTrip },
  { route: '/today', method: getCurrentTrips },
  { route: '/additional-passengers', method: getAdditionalPassengers },
  { route: '/getTrips', method: getTrips },
];

const routerPosts = [
  { route: '/approve-ticket', method: approveTicket },
  { route: '/initialize', method: initializeTrips },
  { route: '/additional', method: addAdditionalTrip },
];

const routerPuts = [
  { route: '/status', method: setTripStatus },
];

const routerDeletes = [
  { route: '', method: deleteTrips },
];

router.get(
  '/current-date',
  getCurrentTripDate,
);

routerGets.forEach(({ route, method }) => {
  router.get(route, passport.authenticate('jwt', { session: false }), method);
});

routerPosts.forEach(({ route, method }) => {
  router.post(route, passport.authenticate('jwt', { session: false }), method);
});

routerPuts.forEach(({ route, method }) => {
  router.put(route, passport.authenticate('jwt', { session: false }), method);
});

routerDeletes.forEach(({ route, method }) => {
  router.delete(route, passport.authenticate('jwt', { session: false }), method);
});

module.exports = router;
