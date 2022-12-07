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
var updateOwnersAndRemoveIsolatedNodes = function (newSelectionConfirmed, base, board, turn) {
    var filtered = base.map(function (o) {
        if (checkIfExistInSelection(newSelectionConfirmed, o)) {
            o = __assign(__assign({}, o), { owner: turn });
        }
        return o;
    });
    return removeIsolatedNodes(filtered, board, turn);
};
var removeIsolatedNodes = function (confirmedSelections, board, turn) {
    var queue = [];
    var baseFilteredFromNone = confirmedSelections.filter(function (s) { return s.owner !== 'none'; });
    var movements = generateMovements(board);
    var attachedNodes = [];
    var searched = {};
    var nodesToCheck = baseFilteredFromNone.filter(function (m) { return m.owner !== turn; }).sort(function (a, b) {
        return turn === 'computer' ? a.row - b.row || a.column - b.column : b.row - a.row || a.column - b.column;
    });
    queue.push(nodesToCheck[0]);
    do {
        var toCheck = queue.shift();
        var neighbors = movements[toCheck.row + "," + toCheck.column];
        neighbors.forEach(function (node) {
            if (!(node.row + "," + node.column in searched)) {
                searched[node.row + "," + node.column] = node;
                var nodeIndex = nodesToCheck.findIndex(function (obj) { return obj.row === node.row && obj.column === node.column; });
                if (nodeIndex !== -1) {
                    attachedNodes.push(nodesToCheck[nodeIndex]);
                    queue.push(nodesToCheck[nodeIndex]);
                }
            }
        });
    } while (queue.length);
    var neutralNodes = confirmedSelections.filter(function (s) { return s.owner === 'none'; });
    var turnNodes = confirmedSelections.filter(function (obj) { return obj.owner === turn; });
    var IsolatedWithAttachedNodes = getIsolatedNodes(attachedNodes, confirmedSelections.filter(function (obj) { return obj.owner !== turn && obj.owner !== 'none'; }));
    return IsolatedWithAttachedNodes.concat(turnNodes, neutralNodes);
};
var getIsolatedNodes = function (attached, base) {
    var unAttached = base.map(function (o) {
        if (!checkIfExistInSelection(attached, o)) {
            o = __assign(__assign({}, o), { owner: 'none' });
        }
        return o;
    });
    return unAttached;
};
var checkIfExistInSelection = function (sel, o) {
    return sel.filter(function (s) { return s.row === o.row && s.column === o.column; }).length > 0;
};
var updateBaseWithPossibleWordTable = function (selectedLetters, possibleWordTable, base) {
    var word = selectedLetters.map(function (obj) { return obj.letter; }).join('');
    var newBase = __spread(base);
    if (word in possibleWordTable) {
        var changed = newBase.map(function (o) {
            if (checkIfPositionMatches(possibleWordTable[word], o)) {
                o = __assign(__assign({}, o), { possibleWords: o.possibleWords.filter(function (wordArr) { return wordArr.map(function (word) { return word.letter; }).join('') !== word.substring(1, word.length); }) });
            }
            return o;
        });
        return changed;
    }
};
var checkIfPositionMatches = function (posArr, obj) {
    var e_1, _a;
    try {
        for (var posArr_1 = __values(posArr), posArr_1_1 = posArr_1.next(); !posArr_1_1.done; posArr_1_1 = posArr_1.next()) {
            var position = posArr_1_1.value;
            var posValues = position.split(',');
            if (obj.row.toString() === posValues[0] && obj.column.toString() === posValues[1]) {
                return true;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (posArr_1_1 && !posArr_1_1.done && (_a = posArr_1.return)) _a.call(posArr_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return false;
};
var checkIfWin = function (selections, turn, max) {
    var win = selections.filter((function (sel) {
        return turn === 'computer' ? sel.row === 0 : sel.row === max - 1;
    }));
    return win.length > 0;
};
var getBestWord = function (base, turn, max) {
    var e_2, _a, e_3, _b;
    var computerBase = base.filter(function (s) { return s.owner === turn; });
    var opponentBase = base.filter(function (s) { return s.owner !== turn; });
    var letterValueArray = [0, 0, 0, 0, 0]; //word length,letters touching opponents base,letters touching own base,letters touching goal 5 higher than starting pos
    var greatestWordValue = 0;
    var selection = [];
    try {
        for (var _c = __values(computerBase.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), i = _e[0], letter = _e[1];
            if (letter.hasOwnProperty('possibleWords') && letter.possibleWords.length) {
                try {
                    for (var _f = (e_3 = void 0, __values(computerBase[i].possibleWords.entries())), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var _h = __read(_g.value, 2), j = _h[0], possibleWord = _h[1];
                        letterValueArray[0] = possibleWord.length; //word length
                        letterValueArray[1] = getCommonElements(opponentBase, possibleWord) * 2.5; //letters touching opp base
                        letterValueArray[2] = getCommonElements(computerBase, possibleWord) * (-1); //letters touching own base
                        letterValueArray[3] = checkIfWin(possibleWord, turn, max) ? 30 : 0; //if touching goal 20 points
                        letterValueArray[4] = getChangeInHeight(possibleWord, turn) * 0.5; //change going upward/downward
                        var wordValue = letterValueArray.reduce(function (acc, curr) { return acc + curr; });
                        if (wordValue > greatestWordValue) {
                            greatestWordValue = wordValue;
                            selection = __spread([computerBase[i]], computerBase[i].possibleWords[j]);
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return selection;
};
var getChangeInHeight = function (word, turn) {
    var sortedByRow = word.map(function (s) { return s.row; }).sort(function (a, b) { return turn === 'computer' ? a - b : b - a; });
    return word[0].row - sortedByRow[0];
};
var getCommonElements = function (base, word) {
    var e_4, _a, e_5, _b;
    var commonElements = {};
    var commonIterator = 0;
    try {
        for (var _c = __values(base.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), i = _e[0], obj = _e[1];
            if (!commonElements[obj.row + "," + obj.column]) {
                commonElements[obj.row + "," + obj.column] = true;
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_4) throw e_4.error; }
    }
    try {
        for (var _f = __values(word.entries()), _g = _f.next(); !_g.done; _g = _f.next()) {
            var _h = __read(_g.value, 2), j = _h[0], obj = _h[1];
            if (commonElements[obj.row + "," + obj.column]) {
                commonIterator++;
            }
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
        }
        finally { if (e_5) throw e_5.error; }
    }
    return commonIterator;
};
var checkIfLetterSelectionIsallowed = function (letter, board, selected, turn) {
    var selectedAgainIndex = selected.findIndex(function (l) { return l.row == letter.row && l.column == letter.column; });
    if (!selected.length) {
        return (letter.owner === turn) ? { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex } : { possibleSelection: false, selectedBeforeIndex: selectedAgainIndex };
    }
    var possibleXpositions = [selected[selected.length - 1].row, selected[selected.length - 1].row + 1, selected[selected.length - 1].row - 1].filter(function (x) { return x >= 0 && x < board.length; });
    var possibleYpositions = [selected[selected.length - 1].column, selected[selected.length - 1].column + 1, selected[selected.length - 1].column - 1].filter(function (x) { return x >= 0 && x < (board[0].length); });
    if (possibleXpositions.includes(letter.row) && possibleYpositions.includes(letter.column)) {
        return { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex };
    }
    return selectedAgainIndex === -1 ? { possibleSelection: false, selectedBeforeIndex: selectedAgainIndex } : { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex };
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
export default {
    checkIfLetterSelectionIsallowed: checkIfLetterSelectionIsallowed,
    updateOwnersAndRemoveIsolatedNodes: updateOwnersAndRemoveIsolatedNodes,
    checkIfWin: checkIfWin,
    getBestWord: getBestWord,
    updateBaseWithPossibleWordTable: updateBaseWithPossibleWordTable
};
