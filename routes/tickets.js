const express = require('express');
const passport = require('passport');

const {
  getPassengerTicketHistory,
  lookupTicket,
  getCurrentTicket,
  getAvailableTickets,
  bookTicket,
  cancelTicket,
} = require('../controllers/tickets');

const router = express.Router();

const routerGets = [
  { route: '/getPassengerTicketHistory', method: getPassengerTicketHistory },
  { route: '/lookupTicket', method: lookupTicket },
  { route: '/getCurrentTicket', method: getCurrentTicket },
  { route: '/getAvailableTickets', method: getAvailableTickets },
];

const routerPosts = [
  { route: '/bookTicket', method: bookTicket },
  { route: '/cancelTicket', method: cancelTicket },
];

routerGets.forEach(({ route, method }) => {
  router.get(route, passport.authenticate('jwt', { session: false }), method);
});

routerPosts.forEach(({ route, method }) => {
  router.post(route, passport.authenticate('jwt', { session: false }), method);
});

module.exports = router;
