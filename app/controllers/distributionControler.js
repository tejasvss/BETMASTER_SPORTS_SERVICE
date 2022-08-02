const LiveSports = require("../models/betApiSports");
const oddSetting = require("../models/oddSetting");
const OddsMargin = require('../models/margin');
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
    } else if (checkSport && checkSport.isLive == false) {
      checkSport.isLive = true;
      checkSport.save();
      return res.status(200).send({
        status: 200,
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
    if (!req.body.category || !req.body.sportId)
      return res
        .status(400)
        .send({ status: 400, Message: "Missing catgeory in payload request" });

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
    }

    else if (checkSport && checkSport.isLive == true) {
      checkSport.isLive = false;
      checkSport.save();
      return res.status(200).send({
        status: 200,
        Message: "Your requested sport status changed now",
        Data: checkSport,
      });
    }
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
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
      const setting = await oddSetting.findOne({ fixtureId: event.game_id });

      if (setting) {
        event.game_oc_list?.forEach((market) => {
          switch (market.oc_group_name) {
            case "1x2":
              market.oc_rate = Number(
                (market.oc_rate * setting.margin1X2).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Double Chance":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginDouble).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Handicap":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginHandicap).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Total":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginUnderOver).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Total 1":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginTotal1).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Total 2":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginTotal2).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Both Teams To Score":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginBothTeamsToScore).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Even/odd":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginEvenOdd).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Team Wins":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginTeamWins).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Individual Total Runs":
              market.oc_rate = Number(
                (market.oc_rate * setting.marginIndividualTotalRuns).toFixed(
                  "2"
                )
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Individual Total Runs (Overs)":
              market.oc_rate = Number(
                (
                  market.oc_rate * setting.marginIndividualTotalRunsOvers
                ).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
              break;
            case "Individual Total Runs Even/Odd (Overs)":
              market.oc_rate = Number(
                (
                  market.oc_rate * setting.marginIndividualTotalRunsEvenOddOvers
                ).toFixed("2")
              );
              market.oc_block =
                market.oc_rate < setting.minOdd ||
                  market.oc_rate > setting.maxOdd
                  ? true
                  : false;
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
  const setting = await oddSetting.findOne({ fixtureId: FI });
  if (setting) {
    response.body?.game_oc_list?.forEach((market) => {
      switch (market.group_name) {
        case "1x2":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.margin1X2).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Double Chance":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginDouble).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Handicap":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginHandicap).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Total":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginUnderOver).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Total 1":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTotal1).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Total 2":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTotal2).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Both Teams To Score":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginBothTeamsToScore).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Even/odd":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginEvenOdd).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case " Next Goal":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginNextGoal).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Team Wins":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTeamWins).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Individual Total Runs":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginIndividualTotalRuns).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Individual Total 2 Even/Odd":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginIndividualTotal2Even).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Individual Total Runs (Overs)":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginIndividualTotalRunsOvers).toFixed(
                "2"
              )
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Individual Total Runs Even/Odd (Overs)":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (
                odd.oc_rate * setting.marginIndividualTotalRunsEvenOddOvers
              ).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Draw":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginDraw).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Team 1, Result + Total":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTeam1ResultTotal).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Team 2, Result + Total":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTeam2ResultTotal).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Tie-Breaks":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTieBreaks).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Total-Tie Breaks":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTotalTieBreaks).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        case "Total Sets":
          market.oc_list.forEach((odd) => {
            odd.oc_rate = Number(
              (odd.oc_rate * setting.marginTotalSets).toFixed("2")
            );
            odd.oc_block =
              odd.oc_rate < setting.minOdd || odd.oc_rate > setting.maxOdd
                ? true
                : false;
          });
          break;
        default:
          break;
      }
    });
  }

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

