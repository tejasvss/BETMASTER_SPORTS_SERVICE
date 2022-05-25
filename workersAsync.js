const amqplib = require("amqplib");

module.exports = function (io, queo, hostname, vhost) {
  io.on("connection", function (socket) {
    async function start() {
      const connection = await amqplib.connect({
        protocol: "amqp",
        hostname,
        port: 5672,
        username: "skystopcs@gmail.com",
        password: "G735@dhu8T",
        vhost,
        locale: "en_US",
        frameMax: 0,
        heartbeat: 580,
      });
      console.log("[AMQP] connected");
      const channel = await connection.createChannel();
      await channel.checkQueue(queo);
      channel.prefetch(1);
      channel.consume(
        queo,
        (data) => {
          const { Body } = JSON.parse(data.content.toString());
          socket.emit("message", transformData(Body));
        },
        {
          noAck: true,
          consumerTag: "consumer",
        }
      );
    }
    start();
  });
};

const transformData = (data) => {
  if (!data) {
    return null;
  }
  return data;
};
