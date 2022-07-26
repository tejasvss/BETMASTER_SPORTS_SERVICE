const OddsMargin = require("../models/margin");
const config = require("../constants/appConstants.json");
const sendHttp = require("../utils/sendHttpReq");

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
exports.getManipulatedData = async (req, res) => {
  try {
    let { category, sportsId } = Object.assign(req.query);

    if (!sportsId || !category)
      return res.status(400).send({
        status: 400,
        Message: "Missing sportsId or category in payload request",
      });

    //To fetch the all Events based on sportsId and category
    let eventsUrl =
      config.API_URL + `/v1/events/${sportsId}/0/sub/30/${category}/en`;

    eventsData = await sendHttp(eventsUrl, options);

    if (!eventsData.body.length)
      return res.status(400).send({ status: 1, page: "/v1/events", body: [] });

    for (var list of eventsData.body) {
      for (var event of list.events_list) {
        const manipulatedResponse = await OddsMargin.find({
          eventId: event.game_id,
          sportsId,
        });

        let url =
          config.API_URL + `/v1/event/${event.game_id}/list/${category}/en`;

        if (!manipulatedResponse.length) {
          response = await sendHttp(url, options);

          event.game_oc_list = response.body.game_oc_list;
        } else if (manipulatedResponse.length) {
          for (const markets of event.game_oc_list) {
            for (const responses of manipulatedResponse) {
              if (responses.marketName == markets.oc_group_name) {
                markets.oc_rate = parseFloat(
                  (markets.oc_rate * responses.margin).toFixed(2)
                );
              }
            }
          }
        }
      }
    }
    return res
      .status(200)
      .send({ status: 1, page: "/v1/events", body: eventsData.body });
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
      body.push([
        {
          championshipName: ChampName,
          historyData: acc[ChampName],
        },
      ]);
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
