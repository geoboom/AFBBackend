let redeemed = false;

const reset = (req, res, next) => {
  redeemed = false;
  res.end();
};
const check = (req, res, next) => {
  res.json({
    redeemed,
  });
};
const redeem = (req, res, next) => {
  redeemed = true;
  res.end();
};

module.exports = {
  reset,
  check,
  redeem
};
