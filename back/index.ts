import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { closePool, db } from "./src/db/client.ts";
import wordRouter from "./src/routes/words.ts";
import connection from "./src/services/connectionService.ts";
import game from "./src/services/gameService.ts";
import type { SocketServer } from "./src/types.ts";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("dist"));
app.use("/api/words", wordRouter);

// Health check endpoint
app.get("/health", async (_req, res) => {
	try {
		await db.execute("SELECT 1");
		res.json({ status: "ok", database: "connected" });
	} catch {
		res.status(503).json({ status: "error", database: "disconnected" });
	}
});

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

// Graceful shutdown
const shutdown = async () => {
	console.log("Shutting down...");
	await closePool();
	server.close(() => {
		console.log("HTTP server closed");
		process.exit(0);
	});
	// Force close after 10 seconds
	setTimeout(() => {
		console.error("Force shutdown");
		process.exit(1);
	}, 10000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
