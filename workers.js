const amqplib = require("amqplib/callback_api");

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
            (data) => {
              const { Header, Body } = JSON.parse(data.content.toString());

              // listening and sending  multiple event
              if (Header.Type === 3) {
                sckt.emit("market", transformData(Body));
                console.log("market send...");
              } else if (Header.Type === 2) {
                sckt.emit("liveScore", transformData(Body));
                console.log("live score send...");
              } else {
                sckt.emit("fixture", transformData(Body));
                console.log("fixture send...");
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

const transformData = (data) => {
  if (!data) {
    return undefined;
  }
  return data?.Events;
};
