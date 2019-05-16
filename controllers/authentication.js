const jwt = require('jsonwebtoken');

const { JWT_OPTIONS } = require('../config/jwt');
const User = require('../models/user');
const constants = require('../constants');

const signupPost = async (req, res, next) => {
  try {
    const {
      firstName, lastName, username, password,
    } = req.body;
    const user = await User.createAccount(
      firstName,
      lastName,
      username,
      password,
      constants.user.group.PASSENGER,
    );
    const { group } = user;
    res.json({
      username, group
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

const loginPost = async (req, res, next) => {
  try {
    const {
      _id, firstName, lastName, username, group, lastSuccessfulLogin, signupTimestamp,
    } = req.user;
    const accessToken = await jwt.sign({
      userId: _id, firstName, lastName, username, group, lastSuccessfulLogin, signupTimestamp,
    }, process.env.JWT_SECRET, JWT_OPTIONS);

    res.json({ accessToken });
  } catch (e) {
    next(e);
  }
};

const verifyTokenPost = async (req, res, next) => {
  try {
    const { accessToken: oldTok } = req.body;
    const { userId } = await jwt.verify(oldTok, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: userId }).exec();
    if (!user) return res.status(404).end();
    const {
      _id, firstName, lastName, username, group, lastSuccessfulLogin, signupTimestamp,
    } = user;
    const accessToken = await jwt.sign({
      userId: _id, firstName, lastName, username, group, lastSuccessfulLogin, signupTimestamp,
    }, process.env.JWT_SECRET, JWT_OPTIONS);
    res.json({
      user: {
        userId: _id, firstName, lastName, username, group, lastSuccessfulLogin, signupTimestamp,
        accessToken,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  verifyTokenPost,
  signupPost,
  loginPost,
};
