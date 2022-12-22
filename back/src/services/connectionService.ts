import crypto from "crypto";
import { InMemorySessionStore } from "./sessionService";
import { SocketServer } from "../types";

const sessionStore = new InMemorySessionStore();

const randomId = () => crypto.randomBytes(8).toString("hex");

const service = (io: SocketServer) => {
  io.use((socket, next) => {
    const { sessionID, username } = socket.handshake.auth;
    if (sessionID) {
      const session = sessionStore.findSession(sessionID);
      if (session) {
        socket.data.sessionID = sessionID;
        socket.data.userID = session.userID;
        socket.data.username = username ?? session.username;
        return next();
      }
    }

    if (!username) {
      return next(new Error("invalid username"));
    }

    const isNameExisting = sessionStore
      .findAllBut(sessionID) // if the session exists, we can use same username
      .some((session) => session.username === username);
    if (isNameExisting) {
      return next(new Error("name already taken"));
    }

    socket.data.sessionID = randomId();
    socket.data.userID = randomId();
    socket.data.username = username;
    next();
  });

  io.on("connection", (socket) => {
    // persist session
    if (socket.data.sessionID) {
      sessionStore.saveSession(socket.data.sessionID, {
        userID: socket.data.userID ?? "",
        username: socket.data.username ?? "",
        connected: true,
      });
    }

    // emit session details
    socket.emit("session", {
      sessionID: socket.data.sessionID,
      userID: socket.data.userID,
    });

    // fetch existing users
    const users = sessionStore.findAllSessions().map((session) => ({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
    }));
    socket.emit("users", users);

    // notify existing users
    socket.broadcast.emit("userconnected", {
      userID: socket.id,
      username: socket.data.username ?? "",
    });

    socket.on("disconnect", async () => {
      if (socket.data.userID && socket.data.sessionID) {
        const matchingSockets = await io.in(socket.data.userID).fetchSockets();
        const isDisconnected = matchingSockets.length === 0;
        if (isDisconnected) {
          // notify other users
          socket.broadcast.emit("userdisconnected", socket.data.userID);
          // update the connection status of the session
          sessionStore.saveSession(socket.data.sessionID, {
            userID: socket.data.userID,
            username: socket.data.username ?? "",
            connected: false,
          });
        }
      }
    });
  });
};

export default { service };
