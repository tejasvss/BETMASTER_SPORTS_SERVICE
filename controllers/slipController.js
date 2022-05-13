const Slip = require("../models/slipModel");

exports.addSlip = async (req, res, next) => {
  // take bet id that is set in  req.body
  const { bet, games, amount } = req.body;

  if (!bet && !games && !amount) {
    return "error";
  }

  const newSlip = await Slip.create({ bet, games, amount });

  if (!newSlip) {
    return "db error";
  }

  res.status(201).json({
    status: "success",
    data: { newSlip },
  });
};
