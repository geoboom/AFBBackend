const { vehicleList } = require('../constants');

const getVehicles = (req, res, next) => {
  res.json({ vehicleList });
};

module.exports = {
  getVehicles,
};
