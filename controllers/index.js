exports.testingGet = (req, res, next) => {
  console.log('testingGet hit');

  const reply = {
    message: 'testingGet reply',
  };
  res.json(reply);
};