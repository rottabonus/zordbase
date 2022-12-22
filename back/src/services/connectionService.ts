import { Server } from "socket.io";

const service = (io: Server) => {
  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
      return next(new Error("invalid username"));
    }

    const existing = Array.from(io.sockets.sockets.entries());
    const isNameExisting = existing.some(
      ([, { data }]) => data.username === username
    );
    if (isNameExisting) {
      return next(new Error("name already taken"));
    }

    socket.data.username = username;
    next();
  });

  io.on("connection", (socket) => {
    // fetch existing users
    const existing = Array.from(io.sockets.sockets.entries());
    const users = existing.map(([id, { data }]) => ({
      userID: id,
      username: data.username,
    }));
    socket.emit("users", users);

    // notify existing users
    socket.broadcast.emit("userconnected", {
      userID: socket.id,
      username: socket.data.username,
    });

    // notify users upon disconnection
    socket.on("disconnect", () => {
      socket.broadcast.emit("userdisconnected", socket.id);
    });
  });
};

export default { service };
