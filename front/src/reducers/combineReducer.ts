import { combineReducers } from "redux";
import baseReducer from "./baseReducer";
import boardReducer from "./boardReducer";
import messageReducer from "./messageReducer";

const rootReducer = combineReducers({
	board: boardReducer,
	base: baseReducer,
	message: messageReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
