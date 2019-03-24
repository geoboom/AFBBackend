const users = [
  {
    username: 'user',
    password: '123',
    type: 'Passenger',
  },
  {
    username: 'driver',
    password: '123',
    type: 'Driver',
  },
];

const trip = {
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

module.exports = {
  users,
  trip,
  ticket,
  user,
};
