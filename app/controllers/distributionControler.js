const LiveSports = require("../models/liveSports");
const oddSetting = require("../models/oddSetting");
const sendHttp = require("../utils/sendHttpReq");
const config = require("../constants/appConstants.json");

exports.addTolive = async (req, res, next) => {
  const sports = await LiveSports.findOne({
    category: req.body.category,
    sportId: req.body.sportId,
  });
  if (sports) {
    if (sports.isLive) {
      return res.status(200).json({
        status: "success",
        message: "sport already live",
      });
    }
    sports.isLive = true;
    sports.save();
    return res.status(200).json({
      status: "success",
      sports,
    });
  }
  const newSports = await LiveSports.create({
    category: req.body.category,
    sportId: req.body.sportId,
  });
  res.status(200).json({
    status: "success",
    newSports,
  });
};
exports.removeFromLive = async (req, res, next) => {
  const sports = await LiveSports.findOne({
    category: req.body.category,
    sportId: req.body.sportId,
  });
  if (!sports) {
    return res.status(404).json({
      status: "fail",
      message: "Sport not found",
    });
  }
  sports.isLive = false;
  sports.save();
  return res.status(200).json({
    status: "success",
    message: "Sport is offline",
  });
};

const setSettings = async (market, id) => {
  const setting = await oddSetting.findOne({ fixtureId: id });
  let newMarket = market;
  if (setting) {
    newMarket?.forEach((mar) => {
      switch (mar.Name) {
        case "1X2":
          mar?.Bets?.forEach((bet) => {
            bet.oc_rate = bet.oc_rate * setting.margin1X2;
          });
          break;
        case "Asian Handicap":
          mar?.Bets?.forEach((bet) => {
            bet.oc_rate = bet.oc_rate * setting.marginHandicap;
          });
          break;
        case "Double Chance":
          mar?.Bets?.forEach((bet) => {
            bet.oc_rate = bet.oc_rate * setting.marginDouble;
          });
          break;
        case "Asian Under/Over":
          mar?.Bets?.forEach((bet) => {
            bet.oc_rate = bet.oc_rate * setting.marginUnderOver;
          });
          break;

        default:
          break;
      }
    });
    // console.log(newMarket[0].Bets);
  }
  return newMarket;
};

// better handle from the front end
exports.getBetsApiEvents = async (req, res, next) => {
  const { cat } = req.params;
  const { sport_id: sportId, count: eventsCount } = req.query;
  // exemple cat = live || line
  let url =
    config.API_URL + `/v1/events/${sportId}/0/sub/${eventsCount}/${cat}/en`;

  const options = {
    method: "GET",
    headers: {
      Package: config.BET_API_TOKEN,
    },
  };
  let response = {};
  try {
    response = await sendHttp(url, options);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      massage: "something went wrong!",
      err,
    });
  }

  res.status(200).json({
    status: 200,
    response,
  });
};

exports.getEventInfo = async (req, res, next) => {
  const { eventId: FI } = req.query;
  const { cat } = req.params;
  let url = config.API_URL + `/v1/event/${FI}/sub/live/en`;

  let options = {
    method: "GET",
    headers: {
      Package: config.BET_API_TOKEN,
    },
  };
  let response = {};
  try {
    response = await sendHttp(url, options);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      massage: "something went wrong!",
      err,
    });
  }

  res.status(200).json({
    status: 200,
    response,
  });
};
