const OddSetting = require("../models/oddSetting");
const BetApiSports = require("../models/betApiSports");

exports.addOddSetting = async (req, res, next) => {
  // check if exists
  const exSetting = await OddSetting.findOneAndUpdate(
    {
      fixtureId: req.body.fixtureId,
    },
    req.body,
    {
      new: true,
    }
  );
  if (!exSetting) {
    const newSetting = await OddSetting.create(req.body);
    return res.status(201).json({
      status: 201,
      data: newSetting,
    });
  }
  res.status(200).json({
    status: 200,
    data: exSetting,
  });
};

exports.getSettingByFixture = async (req, res, next) => {
  const setting = await OddSetting.find({ fixtureId: req.params.fixtureId });

  if (!setting) {
    return res.status(404).json({
      status: 404,
      message: "odds settings not found",
    });
  }

  res.status(200).json({
    status: 200,
    data: setting,
  });
};
