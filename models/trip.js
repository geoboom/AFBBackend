const mongoose = require('mongoose');

const ApiError = require('../helpers/apiError');
const constants = require('../constants');

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
});

tripSchema.statics.addTrip = async function(tripDate, type) {
  const trips = await this.find({ tripDate }).exec();
  const newTrip = new this({
    tripNumber: 1 + trips.length,
    tripDate,
    type,
  });

  return newTrip.save();
};

tripSchema.methods.setTripStatus = async function(status) {
  // no validity check
  this.status = status;
  return this.save();
};

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
