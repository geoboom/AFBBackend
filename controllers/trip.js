const moment = require('moment');

const Trip = require('../models/trip');
const constants = require('../constants');

const getTrips = async (req, res, next) => {
  try {
    const { date } = req.query;
    const trips = await Trip.find({ tripDate: moment(date, 'DD/MM/YYYY') }).exec();
    res.json({ trips });
  } catch(e) {
    next(e);
  }
};

const initializeTrips = async (req, res, next) => {
  try {
    const { date } = req.body;
    const tripDate = moment(date, 'DD/MM/YYYY');
    const existingTrips = await Trip.find({ tripDate }).exec();
    if (existingTrips.length > 0) return res.json({ trips: existingTrips });
    let i = 4;
    const trips = [];
    while(i--) trips.push(await Trip.addTrip(tripDate, constants.trip.types.SCHEDULED));
    res.json({ trips });
  } catch(e) {
    next(e);
  }
};

const setTripStatus = async (req, res, next) => {
  try {
    const { _id, status } = req.body;
    const trip = await Trip.findOne({ _id }).exec();
    const updated = await trip.setTripStatus(status);
    res.json({ trip: updated });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getTrips,
  initializeTrips,
  setTripStatus,
};
