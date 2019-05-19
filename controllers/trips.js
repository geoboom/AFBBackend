const moment = require('moment');

const User = require('../models/user');
const Trip = require('../models/trip');
const Ticket = require('../models/ticket');
const { getCurrTripDate, getCurrTripDateString } = require('../helpers/helperFunctions');
const constants = require('../constants');
const { userList } = require('../helpers/userList');

const {
  socketRoutes: {
    TICKET_APPROVE,
    TRIPS_INITIALIZE,
    TRIP_START,
    TRIP_END,
  },
  ticket: {
    statuses: {
      VALID,
    }
  },
  trip: {
    types: {
      SCHEDULED,
      ADDITIONAL,
    },
    statuses: {
      COMPLETED,
    },
  },
} = constants;
const dateFormat = 'DD/MM/YYYY';
const timeFormat = 'HH:mm:ss';
const startTime = '00:00:00';
const endTime = '10:00:00';

const getDriverTripHistory = async (req, res, next) => {
  const { _id: userId } = req.user;
  try {
    const trips = await Trip.find({ completedByDriver: userId }).exec();
    res.json({ trips });
  } catch (e) {
    next(e);
  }
};

const getAdditionalPassengers = async (req, res, next) => {
  try {
    const tripDateString = getCurrTripDateString();
    let additionalPassengers = (await Ticket.find({
      tripDateString, status: VALID, tripType: ADDITIONAL,
    }).exec()).length;
    (await Trip.find({
      tripDateString, status: COMPLETED, type: SCHEDULED,
    })).forEach(({ expectedPassengers }) => {
      expectedPassengers.forEach(({ ticketStatus }) => {
        if (ticketStatus === VALID) additionalPassengers += 1;
      });
    });
    console.log(additionalPassengers);
    res.json({
      additionalPassengers,
    });
  } catch (e) {
    next(e);
  }
};

const getCurrentTrip = async (req, res, next) => {
  try {
    const tripDateString = getCurrTripDateString();
    const activeTrip = await Trip.findOne({
      tripDateString,
      status: constants.trip.statuses.IN_PROGRESS,
    }).exec();
    let tripNumber = null;
    if (activeTrip) tripNumber = activeTrip.tripNumber;

    res.json({
      currTrip: tripNumber,
    });
  } catch (e) {
    next(e);
  }
};

const getCurrentTripDate = (req, res, next) => {
  try {
    const currTripDate = getCurrTripDateString();
    res.json({
      currTripDate,
      test1: moment(),
    });
  } catch (e) {
    next(e);
  }
};

const deleteTrips = async (req, res, next) => {
  try {
    const { _id } = req.query;
    if (_id === '*') {
      await Trip.deleteMany().exec();
      await Ticket.deleteMany().exec();
    }
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

    const trips = await Trip.find({ tripDateString: tmrDate }).exec();

    return res.json({
      trips,
    })
  } catch(e) {
    next(e);
  }
};

const initializeTrips = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { vehicleId } = req.body;

  try {
    const trips = await Trip.initializeTrips(vehicleId, userId);
    req
      .io
      .to(constants.user.group.PASSENGER)
      .emit(TRIPS_INITIALIZE);
    res.json({ trips });
  } catch(e) {
    next(e);
  }
};

const setTripStatus = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { _id, status } = req.body;
  try {
    const trip = await Trip.findOne({ _id }).exec();
    const updated = await trip.setTripStatus(status, userId);
    if (status === constants.trip.statuses.IN_PROGRESS) {
      req.io.to(constants.user.group.PASSENGER).emit(TRIP_START, { currTrip: trip.tripNumber });
    }
    if (status === constants.trip.statuses.COMPLETED || status === constants.trip.statuses.CANCELLED) {
      req.io.to(constants.user.group.PASSENGER).emit(TRIP_END);
    }
    res.json({ trip: updated });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const approveTicket = async (req, res, next) => {
  const { ticketId, tripId } = req.body;
  try {
    const { userId, trip } = await Ticket.approveTicket(ticketId, tripId);
    req
      .io
      .to(userList[constants.user.group.PASSENGER][userId])
      .emit(TICKET_APPROVE);
    res.json({ trip });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const addAdditionalTrip = async (req, res, next) => {
  const { _id: userId } = req.user;
  const tripDateString = getCurrTripDateString();

  try {
    const firstTrip = await Trip.findOne({
      tripDateString,
      tripNumber: 1,
    }).exec();
    const { vehicleId } = firstTrip;
    const trip = await Trip.addTrip(
      getCurrTripDate(),
      constants.trip.types.ADDITIONAL,
      userId,
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
  getDriverTripHistory,
  approveTicket,
  getAdditionalPassengers,
  getCurrentTrip,
  getCurrentTripDate,
  deleteTrips,
  getTrips,
  getCurrentTrips,
  initializeTrips,
  setTripStatus,
  addAdditionalTrip,
};
