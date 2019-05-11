const trip = {
  DATE_FORMAT: 'DD/MM/YYYY',
  types: {
    SCHEDULED: 'Scheduled',
    ADDITIONAL: 'Additional',
  },
  statuses: {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },
};

const ticket = {
  statuses: {
    VALID: 'Valid',
    REDEEMED: 'Redeemed',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  },
};

const user = {
  group: {
    ADMIN: 'Admin',
    DRIVER: 'Driver',
    PASSENGER: 'Passenger',
  },
};

const socketRoutes = {
  TICKET_APPROVE: 'ticket.approve',
  TRIP_START: 'trip.start',
  TRIP_END: 'trip.end',
  TRIP_INITIALIZE: 'trip.initialize',
};

module.exports = {
  socketRoutes,
  trip,
  ticket,
  user,
};
