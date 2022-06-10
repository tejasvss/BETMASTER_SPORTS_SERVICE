const skocketio = require("socket.io");

module.exports = connectTosocket = (server) => {
  const io = skocketio(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
  return io;
};
