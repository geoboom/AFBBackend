const mongoose = require('mongoose');

const { DB_USER, DB_PASS } = process.env;
const CONNECTION_URL = `mongodb://${DB_USER}:${DB_PASS}@ds155086.mlab.com:55086/adoc_ferry_booking-test2`;
// const CONNECTION_URL = `mongodb://${DB_USER}:${DB_PASS}@ds155684.mlab.com:55684/adoc_ferry_booking-test`;

const dbConn = () => {
  mongoose.Promise = global.Promise;
  mongoose.connect(
    CONNECTION_URL,
    (err) => {
      if (err) {
        console.log('Error connecting to database:', err);
        process.exit(1);
      }
      console.log('Successfully connected to database.');
    },
  );

  return mongoose.connection;
};

module.exports = dbConn;