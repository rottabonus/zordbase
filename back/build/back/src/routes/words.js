"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wordService_1 = __importDefault(require("../services/wordService"));
const router = express_1.default.Router();
router.get('/', (_req, res) => {
    console.log('someone pinged word-service');
    res.send(wordService_1.default.getEntries());
});
exports.default = router;
