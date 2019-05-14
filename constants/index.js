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
  TICKET_BOOKED: 'ticket.booked',
  TICKET_APPROVE: 'ticket.approve',
  TRIP_START: 'trip.start',
  TRIP_END: 'trip.end',
  TRIPS_INITIALIZE: 'trip.initialize',
};

const vehicleList = [
  {
    vehicleId: 'MID 46307',
    capacity: 10,
  },
  {
    vehicleId: 'MID 46308',
    capacity: 8,
  },
  {
    vehicleId: 'MID 46309',
    capacity: 10,
  },
  {
    vehicleId: 'MID 46310',
    capacity: 9,
  },
  {
    vehicleId: 'MID 120',
    capacity: 3,
  },
];

module.exports = {
  vehicleList,
  socketRoutes,
  trip,
  ticket,
  user,
};
