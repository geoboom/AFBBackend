const moment = require('moment');

const User = require('../models/user');
const Trip = require('../models/trip');
const Ticket = require('../models/ticket');
const { getCurrTripDate, getCurrTripDateString } = require('../helpers/helperFunctions');
const constants = require('../constants');
const { userList } = require('../helpers/userList');

const dateFormat = 'DD/MM/YYYY';
const timeFormat = 'HH:mm:ss';
const startTime = '00:00:00';
const endTime = '10:00:00';

const getCurrentTripDate = (req, res, next) => {
  try {
    const currTripDate = getCurrTripDateString();
    res.json({
      currTripDate,
    });
  } catch (e) {
    next(e);
  }
};

const deleteAllTrips = async (req, res, next) => {
  try {
    await Trip.deleteMany().exec();
    await Ticket.deleteMany().exec();
    res.end();
  } catch(e) {
    next(e);
  }
};

const getTrips = async (req, res, next) => {
  try {
    const { tripDateString } = req.query;
    const trips = await Trip.find({ tripDateString }).exec();
    res.json({ trips });
  } catch(e) {
    next(e);
  }
};

const getCurrentTrips = async (req, res, next) => {
  try {
    const currDate = moment().format(dateFormat);
    const tmrDate = moment().add(1, 'd').format(dateFormat);

    if (moment(moment(), timeFormat).isBetween(moment(startTime, timeFormat), moment(endTime, timeFormat))) {
      const res1 = await Trip.find({ tripDateString: currDate }).exec();
      if (res1.length > 0) return res.json({ trips: res1 });
    }

    const trips = await Trip
      .find({ tripDateString: tmrDate })
      .populate('expectedPassengers')
      .populate('passengers')
      .exec();

    for (let i = 0; i < trips.length; i += 1) {
      trips[i].expectedPassengers = trips[i].expectedPassengers.map(({ _id, username, group }) => ({ _id, username, group }));
      trips[i].passengers = trips[i].passengers.map(({ _id, username, group }) => ({ _id, username, group }));
    }

    return res.json({
      trips,
    })
  } catch(e) {
    next(e);
  }
};

const initializeTrips = async (req, res, next) => {
  try {
    const { vehicleId } = req.body;
    const trips = await Trip.initializeTrips(vehicleId);
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
    console.log(e);
    next(e);
  }
};

const approveTicket = async (req, res, next) => {
  try {
    const { ticketId, tripId } = req.body;
    const { userId, trip } = await Ticket.approveTicket(ticketId, tripId);
    req
      .io
      .to(userList[constants.user.group.PASSENGER][userId])
      .emit('path', {

      });
    res.json({ trip });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const addAdditionalTrip = async (req, res, next) => {
  try {
    const tripDateString = getCurrTripDateString();
    const firstTrip = await Trip.findOne({
      tripDateString,
      tripNumber: 1,
    }).exec();
    const { vehicleId } = firstTrip;
    const trip = await Trip.addTrip(
      getCurrTripDate(),
      constants.trip.types.ADDITIONAL,
      vehicleId,
    );
    const trips = await Trip.find({ tripDateString }).exec();
    res.json({ trips });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

module.exports = {
  approveTicket,
  getCurrentTripDate,
  deleteAllTrips,
  getTrips,
  getCurrentTrips,
  initializeTrips,
  setTripStatus,
  addAdditionalTrip,
};
