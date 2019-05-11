require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/user');

opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = function() {
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

  passport.use(new JwtStrategy(
    opts,
    function({ _id }, done) {
      User.findOne({ _id }, function(err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }));
}();
