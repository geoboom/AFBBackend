const jwt = require('jsonwebtoken');

const { JWT_OPTIONS } = require('../config/jwt');
const User = require('../models/user');
const constants = require('../constants');

const signupPost = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.createAccount(username, password, constants.user.group.PASSENGER);
    const { group } = user;
    res.json({ username, group });
  } catch (e) {
    next(e);
  }
};

const loginPost = async (req, res, next) => {
  try {
    const { _id, username, group } = req.user;
    const accessToken = await jwt.sign({ _id, username, group }, process.env.JWT_SECRET, JWT_OPTIONS);
    res.json({ accessToken });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  signupPost,
  loginPost,
};
