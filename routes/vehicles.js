const express = require('express');
const passport = require('passport');

const {
  getVehicles,
} = require('../controllers/vehicles');

const router = express.Router();

const routerGets = [
  { route: '/getVehicles', method: getVehicles },
];

routerGets.forEach(({ route, method }) => {
  router.get(route, passport.authenticate('jwt', { session: false }), method);
});

module.exports = router;
