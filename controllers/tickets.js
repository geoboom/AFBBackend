const Trip = require('../models/trip');
const Ticket = require('../models/ticket');
const constants = require('../constants');
const ApiError = require('../helpers/apiError');
const { getCurrTripDateString } = require('../helpers/helperFunctions');

const estTime = {
  1: '0700 - 0715',
  2: '0715 - 0730',
  3: '0730 - 0745',
  4: '0745 - 0800',
};

const getCurrentTicket = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const tripDateString = getCurrTripDateString();
    const ticket = await Ticket.findOne({
      userId,
      tripDateString,
      status: { $in: [constants.ticket.statuses.VALID, constants.ticket.statuses.REDEEMED] },
    }).exec();

    res.json({
      ticket,
    });
  } catch (e) {
    next(e);
  }
};

const getAvailableTickets = async (req, res, next) => {
  try {
    const tripDateString = getCurrTripDateString();
    const trips = await Trip.find({ tripDateString, type: constants.trip.types.SCHEDULED }).exec();
    if (trips.length === 0) {
      return res.json({
        tickets: [],
      });
    }

    res.json({
      tickets: [
        ...trips.map(({ tripNumber, status, expectedPassengers, capacity }) => ({
          tripNumber,
          estTime: estTime[tripNumber],
          canBook: status !== constants.trip.statuses.COMPLETED && expectedPassengers.length < capacity,
          passengerCount: expectedPassengers.length,
          capacity,
        })).sort(({ tripNumber: a }, { tripNumber: b }) => a-b),
        {
          tripNumber: constants.trip.types.ADDITIONAL,
          canBook: true,
        },
      ],
    });
  } catch (e) {
    next(e);
  }
};

const bookTicket = async (req, res, next) => {
  try {
    const { tripNumber } = req.body;
    const { _id: userId } = req.user;

    const tripType = tripNumber === constants.trip.types.ADDITIONAL
      ? constants.trip.types.ADDITIONAL : constants.trip.types.SCHEDULED;


    const currTripDateString = getCurrTripDateString();

    const ticket = await Ticket.bookTicket(userId, tripType, currTripDateString, tripNumber);
    req.io.to(constants.user.group.DRIVER).emit(constants.socketRoutes.TICKET_BOOKED);
    // req.io.to(constants.user.group.PASSENGER).emit(constants.socketRoutes.TICKET_BOOKED);
    res.json({ ticket });
  } catch(e) {
    console.log(e);
    next(e);
  }
};

const cancelMyTicket = async (req, res, next) => {
  try {
    console.log('test');
    const { _id: userId } = req.user;
    const ticket = await Ticket.cancelMyTicket(userId);
    req.io.to(constants.user.group.DRIVER).emit(constants.socketRoutes.TICKET_BOOKED);
    // req.io.to(constants.user.group.PASSENGER).emit(constants.socketRoutes.TICKET_BOOKED);
    res.json({ ticket });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const lookupTicket = async (req, res, next) => {
  try {
    const { ticketCode } = req.query;
    const tripDateString = getCurrTripDateString();
    const ticket = await Ticket.findOne({ ticketCode, tripDateString }).populate('userId').lean().exec();
    if (ticket) {
      const { username, firstName, lastName, _id } = ticket.userId;
      ticket.userId = _id;
      ticket.username = username;
      ticket.firstName = firstName;
      ticket.lastName = lastName;
    }
    res.json({ ticket });
  } catch(e) {
    console.log(e);
    next(e);
  }
};

const getPassengerTicketHistory = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const tickets = await Ticket.find({ userId }).exec();
    res.json({
      tickets,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  lookupTicket,
  getCurrentTicket,
  getAvailableTickets,
  bookTicket,
  cancelMyTicket,
  getPassengerTicketHistory,
};
