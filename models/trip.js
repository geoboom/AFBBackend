const mongoose = require('mongoose');
const moment = require('moment');

const ApiError = require('../helpers/apiError');
const constants = require('../constants');
const { getCurrTripDate, getCurrTripDateString } = require('../helpers/helperFunctions');

const tripSchema = new mongoose.Schema({
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
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  expectedPassengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  passengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

tripSchema.statics.initializeTrips = async function(vehicleId) {
  const tripDate = getCurrTripDate();
  const tripDateString = getCurrTripDateString();
  const trips = await this.find({ tripDateString }).exec();
  if (trips.length > 0)
    throw new ApiError(`Trips for ${tripDateString} exist.`);

  return Promise.all([
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, vehicleId, 1),
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, vehicleId, 2),
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, vehicleId, 3),
    this.addTrip(tripDate, constants.trip.types.SCHEDULED, vehicleId, 4),
  ]);
};

tripSchema.statics.addTrip = async function(tripDate, type, vehicleId, tripNumber = null) {
  const tripDateString = moment(tripDate).format(constants.trip.DATE_FORMAT);
  const trips = await this.find({
    tripDateString,
  }).exec();
  const newTrip = new this({
    tripNumber: tripNumber ? tripNumber : 1 + trips.length,
    tripDate,
    tripDateString,
    type,
    vehicleId,
    capacity: vehicleId,
  });
  return newTrip.save();
};

tripSchema.methods.setTripStatus = async function(status) {
  this.status = status;
  switch (status) {
    case constants.trip.statuses.IN_PROGRESS:
      this.tripStart = Date.now();
      break;
    case constants.trip.statuses.COMPLETED:
      this.tripEnd = Date.now();
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

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
