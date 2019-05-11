require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const passport = require('passport');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

require('./routes/socket')(io);
require('./config/passport');
const router = require('./routes');
const dbConn = require('./models/db');

const PORT = process.env.PORT || 3000;

dbConn();
app.use(express.json());
app.use(passport.initialize());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', router);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).send(err.message);
});

server.listen(PORT);
console.log(`AFBBackend listening on port ${PORT}`);
