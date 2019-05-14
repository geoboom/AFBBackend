const { user: { group: { PASSENGER, DRIVER, ADMIN } } } = require('../constants');

const userList = {
  [PASSENGER]: {},
  [DRIVER]: {},
  [ADMIN]: {},
};

const registerPresence = (user, socketId) => {
  userList[user.group][user._id] = socketId;
  console.log(userList);
};

 const unregisterPresence = (user) => {
  userList[user.group][user._id] = null;
};

 module.exports = {
   userList,
   registerPresence,
   unregisterPresence,
 };
