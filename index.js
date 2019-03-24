require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const createError = require('http-errors');

const app = express();
const server = require('http').createServer(app);

const User = require('./models/user');
const router = require('./routes');
const dbConn = require('./models/db');

const PORT = process.env.PORT || 3000;

passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.getAuthenticated(username, password);
      if (user) return done(null, user);
      return done(null, false);
    } catch(e) {
      return done(e);
    }
  },
));

dbConn();
app.use(express.json());
app.use(passport.initialize());
app.use('/api', router);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // console.log(err.message);
  res.status(err.status || 500).send(err.message);
});

server.listen(PORT);
console.log(`AFBBackend listening on port ${PORT}`);
