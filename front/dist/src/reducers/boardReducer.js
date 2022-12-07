var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import boardActions from '../actions/boardActions';
var initialState = {
    board: boardActions.createGameBoard(12, 10),
    newGame: true,
    turn: 'player',
    isLoading: false
};
var boardReducer = function (state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case "CREATEBOARD":
            return __assign(__assign({}, state), { board: action.payload });
        case "NEWGAME":
            return __assign(__assign({}, state), { newGame: action.payload.newGame, board: action.payload.board, turn: action.payload.turn, isLoading: action.payload.isLoading });
        case "CHANGETURN":
            return __assign(__assign({}, state), { turn: action.payload });
        case "GAMESTART":
            return __assign(__assign({}, state), { newGame: action.payload });
        case "ISLOADING":
            return __assign(__assign({}, state), { isLoading: action.payload });
        default: {
            return state;
        }
    }
};
export default boardReducer;
