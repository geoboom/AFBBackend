const express = require('express');
const passport = require('passport');

const {
  getPassengerTicketHistory,
  lookupTicket,
  getCurrentTicket,
  getAvailableTickets,
  bookTicket,
  cancelMyTicket,
} = require('../controllers/tickets');

const router = express.Router();

const routerGets = [
  { route: '/my-history', method: getPassengerTicketHistory },
  { route: '/lookup', method: lookupTicket },
  { route: '/my-active', method: getCurrentTicket },
  { route: '/available', method: getAvailableTickets },
];

const routerPosts = [
  { route: '/book', method: bookTicket },
];

const routerDeletes = [
  { route: '/my-ticket', method: cancelMyTicket },
];

routerGets.forEach(({ route, method }) => {
  router.get(route, passport.authenticate('jwt', { session: false }), method);
});

routerPosts.forEach(({ route, method }) => {
  router.post(route, passport.authenticate('jwt', { session: false }), method);
});

routerDeletes.forEach(({ route, method }) => {
  router.delete(route, passport.authenticate('jwt', { session: false }), method);
});

module.exports = router;
