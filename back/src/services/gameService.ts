import { SocketServer } from "../types";

const service = (io: SocketServer) => {
  io.on("connection", (socket) => {
    socket.on("challenge:new", (challengedID) => {
      const challenge = { from: socket.data.userID!, to: challengedID };
      console.log("new challenge", challenge);
      socket.to(challenge.to).emit("challenge:got", challenge);
    });

    socket.on("challenge:accept", (challengerID) => {
      const challenge = { from: socket.data.userID!, to: challengerID };
      console.log("game was accepted, now start with", challenge);
      io.to(challenge.to).to(challenge.from).emit("game:start", challenge);
    });
  });
};

export default { service };
