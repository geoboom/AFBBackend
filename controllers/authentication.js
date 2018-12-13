const { users } = require('../constants/index');

const loginPost = (req, res, next) => {
  const { username, password } = req.body;

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    if (
      user.username === username
      && user.password === password
    ) {
      return res.json(
        {
          username,
          type: user.type,
        },
      );
    }
  }

  res.status(401);

  return res.send('Wrong username or password');
};

module.exports = {
  loginPost,
};
