import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import wordRouter from "./src/routes/words.ts";

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "www")));

app.get("/ping", (_req, res) => {
	console.log("someone pinged here");
	res.send("pong");
});

app.use("/api/words", wordRouter);

const PORT = process.env.PORT ? process.env.PORT : 3000;
app.listen(Number(PORT), "0.0.0.0", () => {
	console.log(`Server running on port ${PORT}`);
});
