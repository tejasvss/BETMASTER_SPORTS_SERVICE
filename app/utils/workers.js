const OddSetting = require("../models/oddSetting");
const amqplib = require("amqplib/callback_api");
const sendHttp = require("./sendHttpReq");

module.exports = function (io, queo, hostname, vhost) {
  io.on("connection", function (socket) {
    function start() {
      amqplib.connect(
        {
          protocol: "amqp",
          hostname,
          port: 5672,
          username: "skystopcs@gmail.com",
          password: "G735@dhu8T",
          vhost,
          locale: "en_US",
          frameMax: 0,
          heartbeat: 580,
        },
        function (err, conn) {
          if (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(start, 1000);
          }
          conn.on("error", function (err) {
            if (err.message !== "Connection closing") {
              console.error("[AMQP] conn error", err.message);
            }
          });
          conn.on("close", function () {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 1000);
          });

          console.log("[AMQP] connected");

          // data will came every 5s

          sendMsg(socket, queo, conn);
        }
      );
    }
    const sendMsg = (sckt, q, con) => {
      con.createChannel(function (err, ch) {
        if (err) console.log(err);
        ch.on("error", function (err) {
          console.error("[AMQP] channel error", err.message);
        });
        ch.on("close", function () {
          console.log("[AMQP] channel closed");
        });
        ch.prefetch(1000, false);
        ch.checkQueue(q, function (err, _ok) {
          if (err) console.log(err);
          ch.consume(
            q,
            async (data) => {
              const { Header, Body } = JSON.parse(data.content.toString());

              // listening and sending  multiple event
              if (Header.Type === 3) {
                // the manipulation will effect only Market
                const market = await checkSettingsAndAddChanges(Body);
                let { Events } = Body;
                Events.Markets = market;
                sckt.emit("market", Events);
                console.log("market send...");
              } else if (Header.Type === 2) {
                sckt.emit("liveScore", transformData(Body));
                // console.log("live score send...");
              } else {
                sckt.emit("fixture", transformData(Body));
                // console.log("fixture send...");
              }
              // ch.ack(data);
            },
            {
              noAck: true,
              consumerTag: "consumer",
            }
          );
          console.log("Worker is started");
        });
      });
    };
    start();
  });
};

// manipulation odds check if setting in database and do changes
const checkSettingsAndAddChanges = async (data) => {
  console.log(data.Events?.[0].FixtureId);
  const exSettings = await OddSetting.findOne({
    fixtureId: data.Events?.[0].FixtureId,
  });
  if (exSettings) {
    const market = setMargin(exSettings, data.Events?.[0].Markets);
    setMinDiffrence(exSettings.minDef, data?.fixtureId, market);
    setMinMaxOdd(exSettings.minOdd, exSettings.maxOdd, data?.fixtureId, market);
    return market;
  }
};

// change Bet objects props Price (odd) in the Bets Array
const setMargin = (setting, market) => {
  let newMarket = market;
  switch (newMarket.Name) {
    case "1X2":
      newMarket?.Bets?.forEach((bet) => {
        bet.Price = bet.Price * setting.margin1X;
      });
      break;
    case "Asian Handicap":
      newMarket?.Bets?.forEach((bet) => {
        bet.Price = bet.Price * setting.marginHandicap;
      });
      break;
    case "Double Chance":
      newMarket?.Bets?.forEach((bet) => {
        bet.Price = bet.Price * setting.marginDouble;
      });
      break;
    case "Asian Under/Over":
      newMarket?.Bets?.forEach((bet) => {
        bet.Price = bet.Price * setting.marginUnderOver;
      });
      break;

    default:
      break;
  }
  return newMarket;
};

const setMinDiffrence = (min, fxID, market) => {
  const options = {
    method: "post",
    body: {
      PackageId: 1016,
      UserName: "skystopcs@gmail.com",
      Password: "G735@dhu8T",
      Suspensions: [
        {
          FixtureId: fxID,
          Markets: [{ MarketId: market.Id }],
        },
      ],
    },
  };

  market?.Bets?.map(async (mar) => {
    if (min > mar.Price) {
      await sendHttp(
        "https://stm-api.lsports.eu/Markets/ManualSuspension/Activate",
        options
      );
    }
  });
};
const setMinMaxOdd = (min, max, fxID, market) => {
  const options = {
    method: "post",
    body: {
      PackageId: 1016,
      UserName: "skystopcs@gmail.com",
      Password: "G735@dhu8T",
      Suspensions: [
        {
          FixtureId: fxID,
          Markets: [{ MarketId: market.Id }],
        },
      ],
    },
  };
  market?.Bets?.map(async (mar, i) => {
    if (min > mar.Price) {
      await sendHttp(
        "https://stm-api.lsports.eu/Markets/ManualSuspension/Activate",
        options
      );
    }
    if (max < mar.Price) {
      await sendHttp(
        "https://stm-api.lsports.eu/Markets/ManualSuspension/Activate",
        options
      );
    }
  });
};

const transformData = (data) => {
  if (!data) {
    return undefined;
  }
  return data?.Events;
};
