// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
//
// const User = require('../models/user');
//
// passport.use(new LocalStrategy(
//   async function(username, password, done) {
//     try {
//       const user = await User.getAuthenticated(username, password);
//       if (user) return done(null, user);
//       return done(null, false);
//     } catch(e) {
//       return done(e);
//     }
//   },
// ));
