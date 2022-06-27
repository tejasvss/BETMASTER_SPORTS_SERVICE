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

const setSettings = (market) => {
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
  const { sport, count: eventsCount } = req.query;
  const sportId = {
    football: 1,
    cricket: 66,
    tennis: 4,
  };

  // exemple cat = live || line
  let url =
    config.API_URL +
    `/v1/events/${sportId[sport]}/0/sub/${eventsCount}/${cat}/en`;

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

  const groupedData = response?.body.reduce((acc, element) => {
    const { tournament_name } = element;
    acc[tournament_name] = acc[tournament_name] || [];
    acc[tournament_name].push({ ...element });
    acc[tournament_name][0]?.events_list.forEach(async (event) => {
      // const setting = await oddSetting.findOne({ fixtureId: event.game_id });
      let setting = true;
      if (setting) {
        event.game_oc_list?.forEach((market) => {
          switch (market.oc_group_name) {
            case "1x2":
              market.oc_rate = (market.oc_rate * 0).toFixed("2");
              break;
            case "Double Chance":
              market.oc_rate = (market.oc_rate * 0).toFixed("2");
              break;
            case "Handicap":
              market.oc_rate = (market.oc_rate * 0).toFixed("2");
              break;
            case "Total":
              market.oc_rate = (market.oc_rate * 0).toFixed("2");
              break;
            default:
              break;
          }

          // if (market.oc_group_name == "1x2") {
          //   market.oc_rate = (market.oc_rate * 0.8).toFixed("2");
          // }
        });
      }
    });
    return acc;
  }, {});
  res.status(200).json({
    status: 200,
    groupedData,
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
