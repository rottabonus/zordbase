import express from "express";
import http from "http";
import wordRouter from "./src/routes/words";
import cors from "cors";
import connection from "./src/services/connectionService";
import { Server } from "socket.io";
import { SocketServer } from "./src/types";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
app.use("/api/words", wordRouter);

const server = http.createServer(app);

const io = new Server<SocketServer>(server, {
  cors: { origin: "http://localhost:6540" },
});

connection.service(io);

const PORT = process.env.PORT ? process.env.PORT : 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
