const jwt = require('jsonwebtoken');

const {
  registerPresence,
  unregisterPresence,
} = require('../../helpers/userList');

const socketAuth = async (socket, next) => {
  const { accessToken } = socket.handshake.query;
  console.log('auth attempt');
  try {
    socket.user = await jwt.verify(accessToken, process.env.JWT_SECRET);
    const { user, id } = socket;
    console.log('auth success');
    registerPresence(user, id);
    socket.join(user.group);
    next();
  } catch (e) {
    console.log('auth fail', e);
    next(new Error('Authentication error.'));
  }
};

const init = (io) => {
  console.log('socket init');
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log('socket connection');
    socket.on('disconnect', () => {
      console.log('socket disconnect');
      unregisterPresence(socket.user);
    });
  });
};

module.exports = init;
