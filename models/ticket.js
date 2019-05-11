const mongoose = require('mongoose');

const User = require('./user');
const Trip = require('./trip');
const ApiError = require('../helpers/apiError');
const constants = require('../constants');

const ONE_HUNDRED_THOUSAND = 100000;
const NINE_HUNDRED_THOUSAND = 900000;

const ticketSchema = new mongoose.Schema({
  location: {
    type: String,
    default: 'HQ ADOC',
    required: true,
  },
  ticketCode: {
    type: Number,
    required: true,
  },
  tripNumber: {
    type: Number,
    required: this.tripType === constants.trip.types.SCHEDULED,
  },
  tripNumberBoarded: {
    type: Number,
    required: this.status === constants.ticket.statuses.REDEEMED,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tripType: {
    type: String,
    enum: Object.values(constants.trip.types),
    required: true,
  },
  expectedTripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: this.tripType === constants.trip.types.SCHEDULED,
  },
  actualTripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: this.status === constants.ticket.statuses.REDEEMED,
  },
  queueNumber: {
    type: Number,
    required: true,
  },
  tripDateString: {
    type: String,
    required: true,
  },
  bookedOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(constants.ticket.statuses),
    default: constants.ticket.statuses.VALID,
    required: true,
  },
  statusTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

ticketSchema.statics.cancelTicket = async function(_id) {
  const ticket = await this.findOne({ _id }).exec();
  if (!ticket) throw new ApiError('Ticket not found.', 404);
  const { expectedTripId, userId, tripType } = ticket;
  if (tripType === constants.trip.types.SCHEDULED) {
    const trip = await Trip.findOne({ _id: expectedTripId }).exec();
    trip.expectedPassengers = trip.expectedPassengers.filter((curr) => curr.toString() !== userId.toString());
    trip.save();
  }
  ticket.status = constants.ticket.statuses.CANCELLED;
  ticket.statusTime = Date.now();
  return ticket.save();
};

ticketSchema.statics.bookTicket = async function(userId, tripType, tripDateString, tripNumber = null) {
  const existingTicket = await this.findOne({
    userId,
    tripDateString,
    status: { $in: [constants.ticket.statuses.VALID, constants.ticket.statuses.REDEEMED] },
  }).exec();

  if (existingTicket) throw new ApiError('Only one booking allowed/already redeemed ticket.', 409);

  const queueNumber = (await this.find({ tripDateString }).exec()).length + 1;

  let conflictTicket;
  let ticketCode;
  do {
    ticketCode = Math.floor(ONE_HUNDRED_THOUSAND + Math.random() * NINE_HUNDRED_THOUSAND);
    conflictTicket = await this.findOne({ tripDateString, ticketCode }).exec();
  } while (conflictTicket);

  if (tripType === constants.trip.types.ADDITIONAL) {
    const newTicket = new this({
      ticketCode,
      queueNumber,
      userId,
      tripType,
      tripDateString,
    });
    return newTicket.save();
  }

  const trip = await Trip.findOne({ tripDateString, tripNumber }).exec();
  const { _id, status, expectedPassengers, capacity } = trip;
  if (status === constants.trip.statuses.COMPLETED || expectedPassengers >= capacity)
    throw new ApiError('Ticket unavailable for booking.', 500);

  trip.expectedPassengers.push(userId);
  trip.save();
  const newTicket = new this({
    ticketCode,
    queueNumber,
    userId,
    tripType,
    tripDateString,
    tripNumber,
    expectedTripId: _id,
  });
  return newTicket.save();
};

ticketSchema.statics.approveTicket = async function(ticketId, tripId) {
  const ticket = await this.findOne({
    _id: ticketId,
    status: constants.ticket.statuses.VALID,
  }).exec();
  if (!ticket) throw new ApiError('No such ticket.', 404);

  const trip = await Trip.findOne({
    _id: tripId,
    status: constants.trip.statuses.IN_PROGRESS,
  }).exec();
  if (!trip) throw new ApiError('No such trip.', 404);

  const { tripNumber } = trip;
  const { userId } = ticket;
  ticket.status = constants.ticket.statuses.REDEEMED;
  ticket.statusTime = Date.now();
  ticket.actualTripId = tripId;
  ticket.tripNumberBoarded = tripNumber;
  trip.passengers.push(userId);

  ticket.save();
  trip.save();

  const user = await User.findOne({ _id: userId }).exec();
  const { username, group } = user;
  return ({
    userId,
    trip: {
      ...trip,
      passengers: trip.passengers.map((passenger) => {
        if (passenger === userId) return ({_id: passenger, username, group});
        return passenger;
      }),
    },
  });
};

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
