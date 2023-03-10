const OddsMargin = require("../models/margin");
const config = require("../constants/appConstants.json");
const sendHttp = require("../utils/sendHttpReq");
var _ = require("lodash");
const group = require("../utils/groupArr");

const options = {
  method: "GET",
  headers: {
    Package: config.BET_API_TOKEN,
  },
};

//Storing margins
exports.storeAndUpdateMargins = async (req, res) => {
  try {
    let { eventId, margin, markets, sportsId } = Object.assign(req.body);

    if (!eventId || !sportsId || !markets || !markets.length)
      return res.status(400).send({
        status: 400,
        Message:
          "Missing eventId,markets or sportsId is missing in payload request",
      });

    let response = [];

    for (const market of markets) {
      await OddsMargin.findOneAndUpdate(
        { eventId, marketName: market.marketName, sportsId },
        {
          $set: {
            eventId,
            margin: market.margin,
            marketName: market.marketName,
            sportsId,
          },
        },
        { new: true, upsert: true }
      ).then((marginData) => {
        response.push(marginData);
      });
    }

    res.status(200).send({
      status: 200,
      Message: "Odd's manipulated successfully",
      Data: response,
    });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

//Fetching the margins based on eventId,category,sportsId
exports.getMarketMargins = async (req, res) => {
  try {
    let { eventId, sportsId } = Object.assign(req.query);

    if ((!eventId, !sportsId))
      return res.status(400).send({
        status: 400,
        Message: "Missing eventId or sportsId in the payload request",
      });

    const marginsData = await OddsMargin.find({ eventId, sportsId });
    if (!marginsData.length)
      return res
        .status(200)
        .send({ status: 200, Message: "No manipulated margins available" });

    res.status(200).send({
      status: 200,
      Message: "Fetching manipulated margins success",
      Data: marginsData,
    });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

//Fetching manipulatedData
// exports.getManipulatedData = async (req, res) => {
//   try {
//     let { category, sportsId } = Object.assign(req.query);

//     if (!sportsId || !category)
//       return res.status(400).send({
//         status: 400,
//         Message: "Missing sportsId or category in payload request",
//       });

//     //To fetch the all Events based on sportsId and category
//     let eventsUrl =
//       config.API_URL + `/v1/events/${sportsId}/0/sub/30/${category}/en`;

//     eventsData = await sendHttp(eventsUrl, options);

//     if (!eventsData.body.length)
//       return res.status(400).send({ status: 1, page: "/v1/events", body: [] });

//     for (var list of eventsData.body) {
//       for (var event of list.events_list) {
//         const manipulatedResponse = await OddsMargin.find({
//           eventId: event.game_id,
//           sportsId,
//         });

//         let url =
//           config.API_URL + `/v1/event/${event.game_id}/list/${category}/en`;

//         if (!manipulatedResponse.length) {
//           response = await sendHttp(url, options);

//   event.game_oc_list = response.body.game_oc_list;
// } else if (manipulatedResponse.length) {
//   for (const markets of event.game_oc_list) {
//     for (const responses of manipulatedResponse) {
//       if (responses.marketName == markets.oc_group_name) {
//         markets.oc_rate = parseFloat(
//           (markets.oc_rate * responses.margin).toFixed(2)
//         );
//       }
//     }
//   }
//         }
//       }
//     }
//     return res
//       .status(200)
//       .send({ status: 1, page: "/v1/events", body: eventsData.body });
//   } catch (error) {
//     res.status(500).send({ status: 500, Message: error.message });
//   }
// };

exports.getManipulatedDataAlt = async (req, res) => {
  try {
    let { category, sportsId } = Object.assign(req.query);

    if (!sportsId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing sportsId or category in payload request",
      });

    //To fetch the all Events based on sportsId and category
    let eventsUrl =
      config.API_URL + `/v1/events/${sportsId}/0/list/5/${category}/en`;

    eventsData = await sendHttp(eventsUrl, options);

    if (!eventsData.body.length)
      return res.status(400).send({ status: 1, page: "/v1/events", body: [] });

    let body = [];

    await Promise.all(
      eventsData?.body?.map(async (event) => {
        const manipulatedResponse = await OddsMargin.find({
          eventId: event.game_id,
          sportsId,
        });
        if (manipulatedResponse.length) {
          event.game_oc_list.forEach((oc) => {
            for (const responses of manipulatedResponse) {
              if (responses.marketName == oc.oc_group_name) {
                oc.oc_rate = parseFloat(
                  (oc.oc_rate * responses.margin).toFixed(2)
                );
              }
            }
          });
        }
        body.push(event);
      })
    );
    return res
      .status(200)
      .send({ status: 1, page: "/v1/events", body, count: body.length });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

exports.getMarketsNames = async (req, res, next) => {
  const { eventId, category } = req.query;

  let url = config.API_URL + `/v1/event/${eventId}/sub/${category}/en`;

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

exports.getSpecificEventsManipulatedData = async (req, res) => {
  try {
    let { category, eventId } = Object.assign(req.query);
    if (!eventId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing eventId or category in the payload request",
      });

    //To fetch the all Events based on sportsId and category
    let eventsUrl = config.API_URL + `/v1/event/${eventId}/sub/${category}/en`;

    eventsData = await sendHttp(eventsUrl, options);

    if (!eventsData.body)
      return res.status(400).send({ status: 1, page: "/v1/events", body: [] });

    const manipulatedResponse = await OddsMargin.find({
      eventId: eventId,
    });

    if (!manipulatedResponse.length) {
      return res.status(200).send(eventsData);
    }

    for (const response of manipulatedResponse) {
      let market = eventsData.body.game_oc_list.find(
        (o) => o.group_name == response.marketName
      );

      for (const list of market.oc_list) {
        list.oc_rate = parseFloat((list.oc_rate * response.margin).toFixed(2));
      }
    }

    return res
      .status(200)
      .send({ status: 1, page: "/v1/events", body: eventsData.body });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

exports.getRezChampionsBySport = async (req, res, next) => {
  const { sportsId, time } = req.query;

  let url =
    config.API_RESULTS_URL + `/v1/rez/getgames/en/${time || 0}/${sportsId}/0`;

  let options = {
    method: "GET",
    headers: {
      Package: config.BET_API_TOKEN,
    },
  };

  let body = [];
  try {
    const response = await sendHttp(url, options);

    response?.body.reduce((acc, element) => {
      const { ChampName } = element;
      acc[ChampName] = acc[ChampName] || [];
      acc[ChampName].push({ ...element });

      function checkDouble(arr, name) {
        const found = arr.some((el) => el.championshipName === name);
        return found ? true : false;
      }

      if (!checkDouble(body, ChampName)) {
        let obj = Object.assign({
          championshipName: ChampName,
          historyData: acc[ChampName],
        });
        body.push(obj);
      }

      return acc;
    }, {});
  } catch (err) {
    return res.status(500).json({
      status: 500,
      massage: "Error fetching Api please check the Payload!",
      err,
    });
  }

  res.status(200).json({
    status: 200,
    body,
  });
};

//Fetching manipulatedData
exports.getManipulatedData = async (req, res) => {
  try {
    let { category, sportsId } = Object.assign(req.query);

    if (!sportsId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing sportsId,eventId or category in payload request",
      });

    const manipulatedResponse = await OddsMargin.find({ sportsId, category });

    //To fetch the all Events based on sportsId and category
    let eventsUrl =
      config.API_URL + `/v1/events/${sportsId}/0/list/30/${category}/en`;

    let response;

    if (!manipulatedResponse.length) {
      response = await sendHttp(eventsUrl, options);
    } else if (manipulatedResponse.length) {
      response = await sendHttp(eventsUrl, options);

      for (const nmResponse of manipulatedResponse) {
        let data = response.body.find((o) => o.game_id === nmResponse.eventId);
        if (data) {
          for (const markets of data.game_oc_list) {
            if (nmResponse.marketName == markets.oc_group_name) {
              markets.oc_rate = parseFloat(
                (markets.oc_rate * nmResponse.margin).toFixed(2)
              );
            }
          }
        }
      }
    }
    return res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

exports.getManipulatedByTournament = async (req, res) => {
  try {
    let { category, sportsId, tournamentId } = Object.assign(req.query);

    if (!sportsId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing sportsId,eventId or category in payload request",
      });

    const manipulatedResponse = await OddsMargin.find({ sportsId, category });

    //To fetch the all Events based on sportsId and category
    let eventsUrl =
      config.API_URL +
      `/v1/events/${sportsId}/${tournamentId}/list/30/${category}/en`;

    let response;

    if (!manipulatedResponse.length) {
      response = await sendHttp(eventsUrl, options);
    } else if (manipulatedResponse.length) {
      response = await sendHttp(eventsUrl, options);

      for (const nmResponse of manipulatedResponse) {
        let data = response.body.find((o) => o.game_id === nmResponse.eventId);
        if (data) {
          for (const markets of data.game_oc_list) {
            if (nmResponse.marketName == markets.oc_group_name) {
              markets.oc_rate = parseFloat(
                (markets.oc_rate * nmResponse.margin).toFixed(2)
              );
            }
          }
        }
      }
    }
    return res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};

exports.getManipulatedTour = async (req, res) => {
  try {
    let { category, sportsId } = Object.assign(req.query);

    if (!sportsId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing sportsId,eventId or category in payload request",
      });

    const manipulatedResponse = await OddsMargin.find({ sportsId, category });

    //To fetch the all Events based on sportsId and category
    let eventsUrl =
      config.API_URL + `/v1/events/${sportsId}/0/list/30/${category}/en`;

    let response;

    if (!manipulatedResponse.length) {
      response = await sendHttp(eventsUrl, options);
    } else if (manipulatedResponse.length) {
      response = await sendHttp(eventsUrl, options);

      for (const nmResponse of manipulatedResponse) {
        let data = response.body.find((o) => o.game_id === nmResponse.eventId);
        if (data) {
          for (const markets of data.game_oc_list) {
            if (nmResponse.marketName == markets.oc_group_name) {
              markets.oc_rate = parseFloat(
                (markets.oc_rate * nmResponse.margin).toFixed(2)
              );
            }
          }
        }
      }
    }
    const body = group(response.body, "tournament_name");
    // console.log(body);
    // const body = response.body.group(({tournament_id}) => tournament_id);
    // console.log(response.body.length);

    return res
      .status(200)
      .send({ status: response.status, page: response.page, body });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};




//This api_is only for backend..Not for frontend

exports.getBackendSpecificEventsManipulatedData = async (req, res) => {
  try {
    let { category, eventId } = Object.assign(req.query);
    if (!eventId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing eventId or category in the payload request",
      });

    //To fetch the all Events based on sportsId and category
    let eventsUrl = config.API_URL + `/v1/event/${eventId}/list/${category}/en`;

    eventsData = await sendHttp(eventsUrl, options);

    if (!eventsData.body)
      return res.status(400).send({ status: 1, page: "/v1/events", body: [] });

    const manipulatedResponse = await OddsMargin.find({
      eventId: eventId,
    });

    if (!manipulatedResponse.length) {
      return res.status(200).send(eventsData);
    }

    for (const response of manipulatedResponse) {
      let market = eventsData.body.game_oc_list.find(
        (o) => o.group_name == response.marketName
      );

      for (const list of market.oc_list) {
        list.oc_rate = parseFloat((list.oc_rate * response.margin).toFixed(2));
      }
    }

    return res
      .status(200)
      .send({ status: 1, page: "/v1/events", body: eventsData.body });
  } catch (error) {
    res.status(500).send({ status: 500, Message: error.message });
  }
};
