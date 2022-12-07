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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var updateBase = function (base) {
    return {
        type: "UPDATEBASE",
        payload: base
    };
};
var createBase = function (base) {
    var e_1, _a, e_2, _b;
    var possibleWordsTable = {};
    try {
        for (var _c = __values(base.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), i = _e[0], letter = _e[1];
            try {
                for (var _f = (e_2 = void 0, __values(letter.possibleWords.entries())), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var _h = __read(_g.value, 2), j = _h[0], possibility = _h[1];
                    var word = letter.letter + possibility.map(function (o) { return o.letter; }).join('');
                    if (!(word in possibleWordsTable)) {
                        possibleWordsTable[word] = [letter.row + "," + letter.column];
                    }
                    else {
                        possibleWordsTable[word].push(letter.row + "," + letter.column);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return {
        type: "CREATEBASE",
        payload: { base: base, possibleWordPositions: possibleWordsTable }
    };
};
var updateSelection = function (selection) {
    return {
        type: "UPDATESELECTION",
        payload: selection
    };
};
var removeSelectionAndPlayedWords = function (selection, played) {
    var history = { base: [], selection: [], turn: '' };
    return {
        type: "REMOVESELECTIONANDPLAYED",
        payload: { selection: selection, played: played, history: history }
    };
};
var removeFromSelection = function (index) {
    return {
        type: "REMOVEFROMSELECTION",
        payload: index
    };
};
var updatePlayedWords = function (played) {
    return {
        type: "UPDATEPLAYEDWORDS",
        payload: played
    };
};
var confirmSelection = function (base, played, selection) {
    return {
        type: "CONFIRMSELECTION",
        payload: { base: base, played: played, selection: selection }
    };
};
var changePlayerName = function (playerName) {
    return {
        type: "CHANGEPLAYERNAME",
        payload: playerName
    };
};
var resetBase = function (base) {
    var played = [];
    var selection = [];
    var history = { base: [], selection: [], turn: '' };
    return {
        type: "RESETGAME",
        payload: { base: base, played: played, selection: selection, history: history }
    };
};
var startingBase = function (base, max, playerName) {
    var startingBase = base.map(function (letter) {
        if (letter.row === 0) {
            letter = __assign(__assign({}, letter), { owner: playerName });
        }
        else if (letter.row === max - 1) {
            letter = __assign(__assign({}, letter), { owner: 'computer' });
        }
        else {
            letter = __assign(__assign({}, letter), { owner: 'none' });
        }
        return letter;
    });
    return startingBase;
};
var createHistory = function (base, selection, turn) {
    return {
        type: "CREATEHISTORY",
        payload: { base: base, selection: selection, turn: turn }
    };
};
export default {
    updateBase: updateBase,
    updateSelection: updateSelection,
    createBase: createBase,
    removeFromSelection: removeFromSelection,
    updatePlayedWords: updatePlayedWords,
    confirmSelection: confirmSelection,
    changePlayerName: changePlayerName,
    resetBase: resetBase,
    removeSelectionAndPlayedWords: removeSelectionAndPlayedWords,
    createHistory: createHistory
};
