import express from "express";
import http from "http";
import wordRouter from "./src/routes/words";
import cors from "cors";
import { Server } from "socket.io";

type User = { username?: string; userID: string };
interface ServerToClientEvents {
  users: (users: Array<User>) => void;
  userconnected: (data: User) => void;
  userdisconnected: (id: string) => void;
}

interface ClientToServerEvents {
  setusername: (username: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  username: string;
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

const server = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, { cors: { origin: "http://localhost:6540" } });

app.get("/ping", (_req, res) => {
  console.log("someone pinged here");
  res.send("pong");
});

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

app.use("/api/words", wordRouter);

const PORT = process.env.PORT ? process.env.PORT : 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
