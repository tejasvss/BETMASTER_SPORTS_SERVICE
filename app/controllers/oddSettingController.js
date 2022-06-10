const OddSetting = require("../models/oddSetting");

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
    res.status(201).json({
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

  res.status(200).json({
    status: 200,
    data: setting,
  });
};
