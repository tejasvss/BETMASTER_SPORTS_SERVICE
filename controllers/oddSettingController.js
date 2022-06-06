const OddSetting = require("../models/oddSetting");

exports.addOddSetting = async (req, res, next) => {
  // check if exists
  const exSetting = await OddSetting.findOne({
    fixtureId: req.body.fixtureId,
    marketId: req.body.marketId,
  });
  if (exSetting) {
    exSetting.oddMargin = req.body.oddMargin;
    exSetting.save();
    res.status(200).json({
      status: 200,
      data: exSetting,
    });
  } else {
    const newSetting = await OddSetting.create(req.body);
    res.status(201).json({
      status: 201,
      data: newSetting,
    });
  }
};

exports.getSettingByFixture = async (req, res, next) => {
  const setting = await OddSetting.find({ fixtureId: req.params.fixtureId });

  res.status(200).json({
    status: 200,
    data: setting,
  });
};
