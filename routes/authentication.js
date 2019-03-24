const express = require('express');
const passport = require('passport');

const {
  signupPost,
  loginPost,
} = require('../controllers/authentication');

const router = express.Router();

router.post('/signup', signupPost);
router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  loginPost,
);

module.exports = router;
