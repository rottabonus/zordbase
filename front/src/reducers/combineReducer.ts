import { combineReducers } from "redux";
import baseReducer from "./baseReducer";
import boardReducer from "./boardReducer";
import messageReducer from "./messageReducer";
import multiplayerReducer from "./multiplayerReducer";

const rootReducer = combineReducers({
	board: boardReducer,
	base: baseReducer,
	message: messageReducer,
	multiplayer: multiplayerReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
