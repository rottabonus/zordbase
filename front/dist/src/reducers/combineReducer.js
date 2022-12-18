import boardReducer from "./boardReducer";
import baseReducer from "./baseReducer";
import messageReducer from "./messageReducer";
import { combineReducers } from "redux";
const rootReducer = combineReducers({
    board: boardReducer,
    base: baseReducer,
    message: messageReducer,
});
export default rootReducer;
