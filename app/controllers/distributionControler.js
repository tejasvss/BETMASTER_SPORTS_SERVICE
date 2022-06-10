const LiveSports = require("../models/liveSports");
const oddSetting = require("../models/oddSetting");
const sendHttp = require("../utils/sendHttpReq");
const config = require("../constants/appConstants.json");

exports.addTolive = async (req, res, next) => {
  const sports = await LiveSports.findOne({ category: req.body.category });
  if (sports) {
    if (sports.live.includes(req.body.sportId)) {
      return res.status(200).json({
        status: "success",
        message: "sport already live",
      });
    }
    sports.live.push(req.body.sportId);
    sports.save();
    return res.status(200).json({
      status: "success",
      sports,
    });
  }
  const newSports = await LiveSports.create({
    category: req.body.category,
    live: [req.body.sportId],
  });
  res.status(200).json({
    status: "success",
    newSports,
  });
};
exports.removeFromLive = async (req, res, next) => {
  const sports = await LiveSports.findOne({ category: req.body.category });
  if (sports) {
    if (!sports.live.includes(req.body.sportId)) {
      return res.status(404).json({
        status: "fail",
        message: "Sport not found",
      });
    }
    sports.live = sports.live.filter((sportid) => sportid !== req.body.sportId);
    sports.save();
    return res.status(200).json({
      status: "success",
      message: "Sport is offline",
    });
  }
};

const setSettings = async (market, id) => {
  const setting = await oddSetting.findOne({ fixtureId: id });
  if (setting) {
    // const newMarket = market;
    market?.forEach((mar) => {
      switch (mar.Name) {
        case "1X2":
          mar?.Bets?.forEach((bet) => {
            bet.Price = bet.Price * setting.margin1X2;
          });
          break;
        case "Asian Handicap":
          mar?.Bets?.forEach((bet) => {
            bet.Price = bet.Price * setting.marginHandicap;
          });
          break;
        case "Double Chance":
          mar?.Bets?.forEach((bet) => {
            bet.Price = bet.Price * setting.marginDouble;
          });
          break;
        case "Asian Under/Over":
          mar?.Bets?.forEach((bet) => {
            bet.Price = bet.Price * setting.marginUnderOver;
          });
          break;

        default:
          break;
      }
    });
    // console.log(newMarket[0].Bets);
    return market;
  }
};

exports.getLiveMatches = async (req, res, next) => {
  const { cat } = req.params;
  const sports = await LiveSports.findOne({ category: cat });
  if (!sports) {
    res.status(404).json({
      status: "fail",
      message: "there is no data to show",
    });
  }
  const options = {
    method: "post",
    body: {
      PackageId: cat === "PreMatch" ? 1016 : 1017,
      UserName: config.STM_USERNAME,
      Password: config.STM_PASSWORD,
      Sports: sports.live,
    },
  };

  const data = await sendHttp(
    "https://stm-snapshot.lsports.eu/preMatch/GetEvents",
    options
  );

  const resEvents = data.Body?.map((event) => {
    let market = event?.Markets;
    // override market
    setSettings(market, event?.FixtureId);
    return {
      id: event.FixtureId,
      league: event.Fixture.League,
      location: event.Fixture.Location,
      participants: event.Fixture.Participants,
      sport: event.Fixture.Sport,
      start: event.Fixture.StartDate,
      markets: market,
    };
  });

  res.status(200).json({
    status: "success",
    resEvents,
  });
};

exports.getStmMatches = async (req, res, next) => {
  const { cat } = req.params;
  const { sport } = req.query;
  const sportsObj = {
    football: 6046,
    cricket: 452674,
    tennis: 54094,
  };
  const options = {
    method: "post",
    body: {
      PackageId: cat === "PreMatch" ? 1016 : 1017,
      UserName: config.STM_USERNAME,
      Password: config.STM_PASSWORD,
    },
  };
  // filter
  if (sport) {
    const sportsArray = sport.split(",").map((sp) => sportsObj[sp]);
    options.body.Sports = sportsArray;
  }

  let data;
  try {
    data = await sendHttp(
      `https://stm-snapshot.lsports.eu/${cat}/GetEvents`,
      options
    );
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: "Error Fetching Data!",
    });
  }

  res.status(200).json({
    status: "success",
    data: data.Body,
  });
};
