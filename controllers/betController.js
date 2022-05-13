const Bet = require("../models/betModel");

exports.addBet = async (req, res, next) => {
  const { odds } = req.body;

  if (!odds) {
    return "error";
  }

  const newBet = await Bet.create({ odds });

  if (!newBet) {
    return "db error";
  }
  // set bet Id ro req.body
  req.body.bet = newBet.id;
  // we just call next
  next();
};
