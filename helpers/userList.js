const { user: { group: { PASSENGER, DRIVER, ADMIN } } } = require('../constants');

export const userList = {
  [PASSENGER]: {},
  [DRIVER]: {},
  [ADMIN]: {},
};

export const registerPresence = (user, socketId) => {
  userList[user.group][user._id] = socketId;
};

export const unregisterPresence = (user) => {
  userList[user.group][user._id] = null;
};
