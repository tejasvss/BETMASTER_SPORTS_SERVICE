const LiveSports = require("../models/betApiSports");
const oddSetting = require("../models/oddSetting");
const sendHttp = require("../utils/sendHttpReq");
const config = require("../constants/appConstants.json");

//addSports to the live
exports.addTolive = async (req, res, next) => {
  try {
    if (!req.body.category || !req.body.sportId) {
      return res
        .status(400)
        .send({ status: 400, Message: "Missing catgeory in payload request" });
    }

    const checkSport = await LiveSports.findOne({
      category: req.body.category,
      sportId: req.body.sportId,
    });
    if (!checkSport) {
      return res
        .status(400)
        .send({ status: 400, Message: "No sport found for entered payload" });
    } else if (checkSport && checkSport.isLive == true) {
      return res.status(400).send({
        status: 400,
        Message: "Your requested sport is already in live",
      });
    } else if (checkSport && checkSport.isLive == false) {
      checkSport.isLive = true;
      checkSport.save();
      return res.status(400).send({
        status: 400,
        Message: "Your requested sport status changed now",
        Data: checkSport,
      });
    }
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

//Changing the status of sports
exports.removeFromLive = async (req, res, next) => {
  try {
    if (!req.body.category || !req.body.sportId) {
      return res
        .status(400)
        .send({ status: 400, Message: "Missing catgeory in payload request" });
    }

    const checkSport = await LiveSports.findOne({
      category: req.body.category,
      sportId: req.body.sportId,
    });
    if (!checkSport) {
      return res
        .status(400)
        .send({ status: 400, Message: "No sport found for entered payload" });
    } else if (checkSport && checkSport.isLive == false) {
      return res.status(400).send({
        status: 400,
        Message: "Your requested sport is already in line",
      });
    } else if (checkSport && checkSport.isLive == true) {
      checkSport.isLive = false;
      checkSport.save();
      return res.status(400).send({
        status: 400,
        Message: "Your requested sport status changed now",
        Data: checkSport,
      });
    }
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
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
  const { eventid: FI } = req.query;

  const { cat } = req.params;
  let url = config.API_URL + `/v1/event/${FI}/sub/${cat}/en`;

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

  response.body?.game_oc_list?.forEach((market) => {
    switch (market.group_name) {
      case "1x2":
        market.oc_list.forEach((odd) => {
          odd.oc_rate = (odd.oc_rate * 0).toFixed("2");
        });
        break;
      case "Double Chance":
        market.oc_list.forEach((odd) => {
          odd.oc_rate = (odd.oc_rate * 0).toFixed("2");
        });
        break;
      case "Handicap":
        market.oc_list.forEach((odd) => {
          odd.oc_rate = (odd.oc_rate * 0).toFixed("2");
        });
        break;
      case "Total":
        market.oc_list.forEach((odd) => {
          odd.oc_rate = (odd.oc_rate * 0).toFixed("2");
        });
        break;
      default:
        break;
    }
  });

  res.status(200).json({
    status: 200,
    response,
  });
};

exports.getMarketsNames = async (req, res, next) => {
  const { eventid: FI } = req.query;

  const { cat } = req.params;
  let url = config.API_URL + `/v1/event/${FI}/sub/${cat}/en`;

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

  const markets = response.body?.game_oc_list?.map((market) => {
    return market.group_name;
  });

  res.status(200).json({
    status: 200,
    markets,
  });
};

//fetch sports
exports.getSports = async (req, res) => {
  try {
    if (!req.body.category) {
      return res
        .status(400)
        .send({ status: 400, Message: "Missing catgeory in payload request" });
    }

    const sportsData = await LiveSports.find({ category: req.body.category });

    return res.status(200).send({
      status: 200,
      Message: "sports data fetched successfully",
      sportsCount: sportsData.length,
      Data: sportsData,
    });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};
