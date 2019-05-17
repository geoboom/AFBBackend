const moment = require('moment');

const dateFormat = 'DD/MM/YYYY';
const timeFormat = 'HH:mm:ss';
const startTime = '00:00:00';
const endTime = '10:00:00';

const getCurrTripDate = () => (
  moment(moment().utcOffset('+0800'), timeFormat)
    .isBetween(moment(startTime, timeFormat), moment(endTime, timeFormat))
    ? moment() : moment().add(1, 'd')
);

const getCurrTripDateString = () => getCurrTripDate().format(dateFormat);

module.exports = {
  getCurrTripDate,
  getCurrTripDateString,
};
