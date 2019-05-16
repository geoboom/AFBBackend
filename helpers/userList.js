const { user: { group: { PASSENGER, DRIVER, ADMIN } } } = require('../constants');

const userList = {
  [PASSENGER]: {},
  [DRIVER]: {},
  [ADMIN]: {},
};

const registerPresence = (user, socketId) => {
  userList[user.group][user.userId] = socketId;
  console.log(userList);
};

 const unregisterPresence = (user) => {
  userList[user.group][user.userId] = null;
};

 module.exports = {
   userList,
   registerPresence,
   unregisterPresence,
 };
