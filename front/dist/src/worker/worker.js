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
addEventListener('message', function (event) {
    //console.log('postmessage event')
    var wholeBoard = calculateValues(event.data.board, event.data.playerName, event.data.words);
    postMessage(wholeBoard);
});
var calculateValues = function (board, playerName, allWords) {
    var e_1, _a;
    var base = [];
    var _loop_1 = function (j, boardRow) {
        var owner = j === 0 ? playerName : j === board.length - 1 ? 'computer' : 'none';
        var row = boardRow.map(function (letter, column) { return ({ 'letter': letter, 'row': j, 'column': column, 'owner': owner }); });
        base.push.apply(base, __spread(row));
    };
    try {
        for (var _b = __values(board.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), j = _d[0], boardRow = _d[1];
            _loop_1(j, boardRow);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var mappedWithPossibilities = base.map(function (letter) {
        letter = __assign(__assign({}, letter), { possibleWords: checkAllPossibleWordsAndRoutes(letter, board, allWords) });
        return letter;
    });
    return mappedWithPossibilities;
};
var checkAllPossibleWordsAndRoutes = function (letter, board, all) {
    var movements = generateMovements(board);
    var possibilities = [];
    var allWords = all.filter(function (w) { return w.toUpperCase().startsWith(letter.letter); });
    var words = allWords.map(function (w) { return w.toUpperCase(); });
    words.forEach(function (possibleWord) {
        var route = getRouteForWord(possibleWord, movements, letter);
        if (route.length > 0) {
            possibilities.push(route.filter(function (w, i) { return i !== 0; }));
        }
    });
    return possibilities;
};
var getRouteForWord = function (wordStr, movements, obj) {
    var queue = __spread(movements[getKeyNameObject(obj)]);
    var searched = [obj];
    var selection = [obj];
    var curPos = [obj.row, obj.column];
    var _loop_2 = function () {
        var toCheck = queue.shift();
        var curWord = selection.map(function (s) { return s.letter; }).join('');
        if (searched.findIndex(function (l) { return l.row === toCheck.row && l.column === toCheck.column; }) === -1) {
            if (wordStr.includes(curWord + toCheck.letter) && checkPosition(toCheck.row, toCheck.column, curPos)) {
                selection.push(toCheck);
                curPos = [toCheck.row, toCheck.column];
                queue.push.apply(queue, __spread(movements[toCheck.row + "," + toCheck.column]));
                if (wordStr === curWord + toCheck.letter) {
                    return { value: selection };
                }
                var reSearchable = returnNonPathSearchedNodeIndexes(searched, toCheck, movements, selection, wordStr);
                reSearchable.forEach(function (nodeIndex) {
                    searched.splice(nodeIndex, 1);
                    var returned = searched.splice(nodeIndex, 1);
                    queue.unshift.apply(queue, __spread(returned));
                });
            }
        }
        searched.push(toCheck);
    };
    do {
        var state_1 = _loop_2();
        if (typeof state_1 === "object")
            return state_1.value;
    } while (queue.length > 0);
    return [];
};
var returnNonPathSearchedNodeIndexes = function (searched, obj, allMoves, selection, wordStr) {
    var objectMoves = allMoves[obj.row + "," + obj.column];
    var toReturnIndexes = [];
    objectMoves.forEach(function (move) {
        searched.forEach(function (pos, i) {
            if (JSON.stringify(pos) === JSON.stringify(move)) {
                if (selection.findIndex(function (l) { return l.row === pos.row && l.column === pos.column; }) === -1 && wordStr.startsWith(selection.map(function (s) { return s.letter; }).join('') + pos.letter)) {
                    toReturnIndexes.push(i);
                }
            }
        });
    });
    return toReturnIndexes;
};
var generateMovements = function (board) {
    var moves = {};
    board.forEach(function (row, r) {
        row.forEach(function (column, c) {
            moves[r + "," + c] = getNeighborsData({ 'letter': board[r][c], 'row': r, 'column': c, 'owner': 'none' }, board);
        });
    });
    return moves;
};
var getKeyNameObject = function (obj) {
    return obj.row + "," + obj.column;
};
var getNeighborsData = function (node, board) {
    var possibleMoves = [];
    var possibleXpositions = [node.row, node.row + 1, node.row - 1].filter(function (x) { return x >= 0 && x < board.length; });
    var possibleYpositions = [node.column, node.column + 1, node.column - 1].filter(function (x) { return x >= 0 && x < (board[0].length); });
    possibleXpositions.forEach(function (xPos) {
        possibleYpositions.forEach(function (yPos) {
            if (!(xPos === node.row && yPos === node.column)) {
                possibleMoves.push({ 'row': xPos, 'column': yPos, 'letter': board[xPos][yPos], 'owner': 'none' });
            }
        });
    });
    return possibleMoves;
};
var checkPosition = function (r, c, arr) {
    return (r - 1 === arr[0] || r === arr[0] || r + 1 === arr[0]) && (c - 1 === arr[1] || c === arr[1] || c + 1 === arr[1]) && !(r === arr[0] && c === arr[1]);
};
