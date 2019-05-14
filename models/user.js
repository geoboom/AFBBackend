const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ApiError = require('../helpers/apiError');
const constants = require('../constants');

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: v => /^[a-zA-Z0-9_-]{6,15}$/.test(v),
      message: '{VALUE} is not a valid username.',
    }
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  group: {
    type: String,
    enum: Object.values(constants.user.group),
  },
  lastSuccessfulLogin: {
    type: Date,
  },
}, {
  timestamps: {
    createdAt: 'signupTimestamp',
  },
});

// [schema].statics -> model level
// [schema].methods -> document (instance) level

userSchema.methods.comparePassword = function(cdtPassword) {
  return bcrypt.compare(cdtPassword, this.password);
};

userSchema.statics.createAccount = async function(username, password, group) {
  const user = await this.findOne({ username }).exec();
  if (user) throw new ApiError('Username exists.', 409);

  const newUser = new this({
    username,
    password,
    group,
  });

  return newUser.save();
};

userSchema.statics.getAuthenticated = async function(username, password) {
  const user = await this.findOne({ username }).exec();
  if (!user) throw new ApiError('Wrong username or password entered.', 401);

  const match = await user.comparePassword(password);
  if (match) {
    user.lastSuccessfulLogin = new Date();
    await user.save();
    return user;
  }

  throw new ApiError('Wrong username or password entered.', 401);
};

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }

  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(user.password)) {
    throw new ApiError('Password must be at least 6 characters long.', 500);
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if(err) return next(err);

      user.password = hash;
      next();
    });
  });
});

const User = mongoose.model('User', userSchema);
module.exports = User;
