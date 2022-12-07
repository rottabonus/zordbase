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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var initialState = {
    base: [],
    selection: [],
    playedWords: [],
    playerName: 'player',
    possibleWordPositions: {},
    stateHistory: [{
            base: [],
            selection: [],
            turn: ''
        }]
};
var baseReducer = function (state, action) {
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case "CREATEBASE":
            return __assign(__assign({}, state), { base: action.payload.base, possibleWordPositions: action.payload.possibleWordPositions });
        case "UPDATEBASE":
            return __assign(__assign({}, state), { base: action.payload });
        case "UPDATESELECTION":
            return __assign(__assign({}, state), { selection: action.payload });
        case "UPDATEPLAYEDWORDS":
            return __assign(__assign({}, state), { playedWords: action.payload });
        case "REMOVEFROMSELECTION":
            return __assign(__assign({}, state), { selection: state.selection.slice(0, action.payload) });
        case "CONFIRMSELECTION":
            return __assign(__assign({}, state), { selection: action.payload.selection, base: action.payload.base, playedWords: action.payload.played });
        case "CHANGEPLAYERNAME":
            return __assign(__assign({}, state), { playerName: action.payload });
        case "RESETGAME":
            return __assign(__assign({}, state), { base: action.payload.base, selection: action.payload.selection, playedWords: action.payload.played, stateHistory: [action.payload.history] });
        case "REMOVESELECTIONANDPLAYED":
            return __assign(__assign({}, state), { selection: action.payload.selection, playedWords: action.payload.played, stateHistory: [action.payload.history] });
        case "CREATEHISTORY":
            return __assign(__assign({}, state), { stateHistory: __spread(state.stateHistory, [{ base: action.payload.base, selection: action.payload.selection, turn: action.payload.turn }]) });
        default: {
            return state;
        }
    }
};
export default baseReducer;
