const amqplib = require("amqplib/callback_api");
const Odds = require("./models/oddsModel");

module.exports = function (queo, hostname, vhost) {
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
        setInterval(() => {
          sendMsg(queo, conn);
        }, 5000);
      }
    );
  }
  const sendMsg = (q, con) => {
    con.createChannel(function (err, ch) {
      if (err) console.log(err);
      ch.on("error", function (err) {
        console.error("[AMQP] channel error", err.message);
      });
      ch.on("close", function () {
        console.log("[AMQP] channel closed");
      });
      ch.prefetch(1, false);
      ch.checkQueue(q, function (err, _ok) {
        if (err) console.log(err);
        ch.consume(
          q,
          (data) => {
            const { Body } = JSON.parse(data.content.toString());
            storeData(Body, ch);
          },
          { noAck: false }
        );
        console.log("Worker is started");
      });
    });
  };
  start();
};

const storeData = async (data, ch) => {
  if (!data) {
    return;
  }
  try {
    const odds = await Odds.findOneAndUpdate({ events: data.Events });
    if (!odds) return;
  } catch (err) {
    console.log(err);
  }
};
