"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const words_1 = __importDefault(require("./src/routes/words"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default());
app.get('/ping', (_req, res) => {
    console.log('someone pinged here');
    res.send('pong');
});
app.use('/api/words', words_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
