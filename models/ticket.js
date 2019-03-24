const mongoose = require('mongoose');

const ApiError = require('../helpers/apiError');
const constants = require('../constants');

const ticketSchema = new mongoose.Schema({
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
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: this.tripType === constants.trip.types.SCHEDULED || this.status === constants.ticket.statuses.REDEEMED,
  },
  queueNumber: {
    type: Number,
    required: true,
  },
  tripDate: {
    type: Date,
    required: true,
  },
  timeBooked: {
    type: Date,
    default: Date.now(),
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
    default: Date.now(),
    required: true,
  },
});

ticketSchema.statics.bookTicket = async function(userId, tripType, tripId = null) {
  const existingTicket = await this.findOne({
    userId, tripType, status: { $in: [constants.ticket.statuses.VALID, constants.ticket.statuses.REDEEMED] },
  }).exec();

  if (existingTicket) throw new ApiError('Only one booking allowed/already redeemed ticket.', 409);

  switch(tripType) {
    case constants.trip.types.SCHEDULED: {
      const newTicket = new this({
        userId,
        tripId,
        tripType,
      });
      return newTicket.save();
    }
    case constants.trip.types.ADDITIONAL: {
      const newTicket = new this({
        userId,
        tripType,
      });
      return newTicket.save();
    }
    default:
      throw new ApiError('Invalid ticket trip type.', 500);
  }
};

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
