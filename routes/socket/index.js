const jwt = require('jsonwebtoken');

const {
  registerPresence,
  unregisterPresence,
} = require('../../helpers/userList');

const socketAuth = async (socket, next) => {
  const { accessToken } = socket.handshake.query;

  try {
    socket.user = await jwt.verify(accessToken, process.env.JWT_SECRET);
    const { user, id } = socket;
    registerPresence(user, id);
    next();
  } catch (e) {
    next(new Error('Authentication error.'));
  }
};

const init = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      unregisterPresence(socket.user);
    });
  });
};

module.exports = init;
