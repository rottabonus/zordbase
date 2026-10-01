import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import wordRouter from "./src/routes/words.ts";
import connection from "./src/services/connectionService.ts";
import game from "./src/services/gameService.ts";
import type { SocketServer } from "./src/types.ts";

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
game.service(io);

const PORT = process.env.PORT ? process.env.PORT : 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
