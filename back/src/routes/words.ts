import express from "express";
import { logger } from "../logger.ts";
import wordService from "../services/wordService.ts";

const router = express.Router();

router.get("/", (_req, res) => {
	logger.info("someone pinged word-service");
	res.send(wordService.getEntries());
});

export default router;
