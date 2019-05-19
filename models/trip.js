const mongoose = require('mongoose');
const moment = require('moment');

const ApiError = require('../helpers/apiError');
const constants = require('../constants');
const { getCurrTripDate, getCurrTripDateString } = require('../helpers/helperFunctions');

const tripSchema = new mongoose.Schema({
  location: {
    type: String,
    default: 'HQ ADOC',
    required: true,
  },
  tripNumber: {
    type: Number,
    required: true,
  },
  tripStart: {
    type: Date,
  },
  tripEnd: {
    type: Date,
  },
  tripDate: {
    type: Date,
    required: true,
  },
  tripDateString: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(constants.trip.types),
    default: constants.trip.types.SCHEDULED,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(constants.trip.statuses),
    default: constants.trip.statuses.NOT_STARTED,
    required: true,
  },
  vehicleId: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  completedByDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  addedByDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expectedPassengers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      ticketStatus: {
        type: String,
        enum: Object.values(constants.ticket.statuses),
        default: constants.ticket.statuses.VALID,
      },
      tripNumber: {
        type: Number,
      },
    },
  ],
  passengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

tripSchema.statics.initializeTrips = async function(vehicleId, userId) {
  const vehicle = constants.vehicleList
    .find(({ vehicleId: cdtId }) => cdtId === vehicleId);
  if (!vehicle) throw new ApiError('Vehicle not found', 404);

  const tripDate = getCurrTripDate();
  const tripDateString = getCurrTripDateString();
  const trips = await this.find({ tripDateString }).exec();
  if (trips.length > 0)
    throw new ApiError(`Trips for ${tripDateString} exist.`);

  return Promise.all([
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, userId, vehicleId, 1),
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, userId, vehicleId, 2),
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, userId, vehicleId, 3),
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, userId, vehicleId, 4),
  ]);
};

tripSchema.statics.addTrip = async function(tripDate, type, addedByDriver, vehicleId, tripNumber = null) {
  const tripDateString = moment(tripDate).format(constants.trip.DATE_FORMAT);
  const trips = await this.find({
    tripDateString,
  }).exec();
  const newTrip = new this({
    tripNumber: tripNumber ? tripNumber : 1 + trips.length,
    tripDate,
    tripDateString,
    type,
    addedByDriver,
    vehicleId,
    expectedPassengers: [],
    capacity: constants.vehicleList
      .find(({ vehicleId: cdtId }) => cdtId === vehicleId).capacity,
  });
  return newTrip.save();
};

tripSchema.methods.setTripStatus = async function(status, userId) {
  this.status = status;
  switch (status) {
    case constants.trip.statuses.IN_PROGRESS:
      this.tripStart = Date.now();
      break;
    case constants.trip.statuses.COMPLETED:
      this.tripEnd = Date.now();
      this.completedByDriver = userId;
      break;
    case constants.trip.statuses.CANCELLED:
      this.tripStart = Date.now();
      this.tripEnd = Date.now();
      break;
    default:
      break;
  }
  return this.save();
};

tripSchema.post('find', async function(docs) {
  for (let doc of docs) {
    await doc
      .populate('addedByDriver', '_id username group firstName lastName')
      .populate('completedByDriver', '_id username group firstName lastName')
      .populate('expectedPassengers.user', '-password')
      .populate('passengers', '_id username group firstName lastName')
      .execPopulate();
  }
});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
