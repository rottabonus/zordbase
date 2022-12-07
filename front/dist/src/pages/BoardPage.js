var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
import React, { useEffect } from 'react';
import gameService from '../services/game';
import wordService from '../services/words';
import { Board } from '../components/Board';
import { GameBoardButtons } from '../components/GameBoardButtons';
import { GameBoardHeader } from '../components/GameBoardHeader';
import { PlayedWordList } from '../components/PlayedWordList';
import { LoadingTable } from '../components/LoadingTable';
import { LogoContainer } from '../components/LogoContainer';
import { Message } from '../components/Message';
import { useSelector, useDispatch } from 'react-redux';
import allActions from '../actions/allActions';
export var GameBoardPage = function () {
    var board = useSelector(function (state) { return state.board.board; });
    var turn = useSelector(function (state) { return state.board.turn; });
    var newGame = useSelector(function (state) { return state.board.newGame; });
    var base = useSelector(function (state) { return state.base.base; });
    var selected = useSelector(function (state) { return state.base.selection; });
    var playedWords = useSelector(function (state) { return state.base.playedWords; });
    var playerName = useSelector(function (state) { return state.base.playerName; });
    var isLoading = useSelector(function (state) { return state.board.isLoading; });
    var possibleWordPositions = useSelector(function (state) { return state.base.possibleWordPositions; });
    var stateHistory = useSelector(function (state) { return state.base.stateHistory; });
    var messageState = useSelector(function (state) { return state.message; });
    var webWorker = new Worker('../worker/worker.js', { type: 'module' });
    var dispatch = useDispatch();
    var gameChange = function () {
        setTimeout(function () {
            dispatch(allActions.messageActions.setMessage("winner is " + turn, 'message'));
            startNewGame();
        }, 1500);
    };
    var startNewGame = function () {
        dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []));
        dispatch(allActions.boardActions.newGame(true, playerName, true));
        if (messageState.type === 'start') {
            dispatch(allActions.messageActions.clearMessage());
        }
    };
    var checkBoard = function () { return __awaiter(void 0, void 0, void 0, function () {
        var positionsWithPossibleWords, possibleWordsPercentage;
        return __generator(this, function (_a) {
            positionsWithPossibleWords = base.filter(function (w) { return w.possibleWords.length > 0; });
            possibleWordsPercentage = 100 * positionsWithPossibleWords.length / base.length;
            if (!Number.isNaN(possibleWordsPercentage)) {
                if (possibleWordsPercentage < 74) {
                    initializeBase();
                }
                else {
                    dispatch(allActions.boardActions.isLoading(false));
                }
            }
            return [2 /*return*/];
        });
    }); };
    var initializeBase = function () { return __awaiter(void 0, void 0, void 0, function () {
        var words, objToSend;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, wordService.fetchAll()];
                case 1:
                    words = _a.sent();
                    objToSend = { board: board, playerName: playerName, words: words };
                    webWorker.postMessage(objToSend);
                    dispatch(allActions.boardActions.isLoading(true));
                    webWorker.onmessage = function (event) {
                        dispatch(allActions.baseActions.createBase(event.data));
                    };
                    return [2 /*return*/];
            }
        });
    }); };
    var showResetModal = function () {
        dispatch(allActions.messageActions.setMessage('are you sure you want to reset the game?', 'reset'));
    };
    var showStartModal = function () {
        dispatch(allActions.messageActions.setMessage('are you sure you want to start new game?', 'start'));
    };
    var resetGame = function () {
        dispatch(allActions.baseActions.resetBase(stateHistory[1].base));
        dispatch(allActions.messageActions.clearMessage());
    };
    var clearMessage = function () {
        dispatch(allActions.messageActions.clearMessage());
    };
    var confirmSelection = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newWord, wordExist, playedAgain, history_1, confirmedAndFiltered, checkGame, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newWord = selected.map(function (s) { return s.letter; }).join('');
                    return [4 /*yield*/, wordService.fetchMatch(newWord)];
                case 1:
                    wordExist = _a.sent();
                    playedAgain = playedWords.filter(function (word) { return word.owner === turn; }).filter(function (word) { return word.word === newWord; });
                    if (wordExist && !playedAgain.length) {
                        history_1 = __spread(base);
                        dispatch(allActions.baseActions.createHistory(history_1, selected, turn));
                        confirmedAndFiltered = gameService.updateOwnersAndRemoveIsolatedNodes(selected, base, board, turn);
                        checkGame = gameService.checkIfWin(selected, turn, board.length);
                        dispatch(allActions.baseActions.confirmSelection(confirmedAndFiltered, __spread(playedWords, [{ word: newWord, owner: turn, turn: stateHistory.length }]), []));
                        checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn('computer'));
                    }
                    else {
                        message = playedAgain.length > 0 ? "cant play same word twice, " + newWord + " already played" : "word " + newWord + ", does not exist";
                        dispatch(allActions.messageActions.setMessage(message, 'message'));
                        removeSelection();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var removeSelection = function () {
        dispatch(allActions.baseActions.removeFromSelection(0));
    };
    var computersTurn = function () {
        var history = __spread(base);
        var computerSelected = gameService.getBestWord(base, turn, board.length);
        var newSelectionConfirmed = computerSelected.map(function (s) { return ({ letter: s.letter, row: s.row, column: s.column, owner: turn, possibleWords: s.possibleWords }); });
        dispatch(allActions.baseActions.createHistory(history, newSelectionConfirmed, turn));
        computerSelect(newSelectionConfirmed);
        var timeOutCounter = newSelectionConfirmed.length;
        setTimeout(function () {
            var confirmedAndFiltered = gameService.updateOwnersAndRemoveIsolatedNodes(newSelectionConfirmed, base, board, turn);
            var fullyUpdatedBase = gameService.updateBaseWithPossibleWordTable(newSelectionConfirmed, possibleWordPositions, confirmedAndFiltered);
            var checkGame = gameService.checkIfWin(newSelectionConfirmed, turn, board.length);
            dispatch(allActions.baseActions.confirmSelection(fullyUpdatedBase, __spread(playedWords, [{ word: computerSelected.map(function (s) { return s.letter; }).join(''), owner: turn, turn: stateHistory.length }]), []));
            checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn(playerName));
        }, timeOutCounter * 500 + 700);
    };
    var selectLetter = function (letter, row, column, owner) { return __awaiter(void 0, void 0, void 0, function () {
        var obj, selectionOnBase, result;
        return __generator(this, function (_a) {
            obj = { letter: letter, row: row, column: column, owner: owner };
            selectionOnBase = base.filter(function (s) { return s.owner === obj.owner && s.column === obj.column && s.row === obj.row; });
            if (selectionOnBase.length || selected.length) {
                result = gameService.checkIfLetterSelectionIsallowed(obj, board, selected, turn);
                if (result.possibleSelection) {
                    result.selectedBeforeIndex === -1 ?
                        dispatch(allActions.baseActions.updateSelection(__spread(selected, [obj]))) :
                        dispatch(allActions.baseActions.removeFromSelection(result.selectedBeforeIndex));
                }
            }
            return [2 /*return*/];
        });
    }); };
    var timeTravel = function (turn) {
        var currentBase = __spread(base);
        var timeOutCounter = stateHistory[turn].selection.length;
        dispatch(allActions.baseActions.updateBase(stateHistory[turn].base));
        computerSelect(stateHistory[turn].selection);
        setTimeout(function () {
            backToPresent(currentBase);
            removeSelection();
        }, timeOutCounter * 500 + 700);
    };
    var computerSelect = function (selection) {
        var e_1, _a;
        var _loop_1 = function (i, s) {
            var selectionArray = selection.filter(function (s, j) { return j <= i; });
            setTimeout(function () {
                dispatch(allActions.baseActions.updateSelection(selectionArray));
            }, (i + 1) * 500);
        };
        try {
            for (var _b = __values(selection.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), i = _d[0], s = _d[1];
                _loop_1(i, s);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    var backToPresent = function (base) {
        dispatch(allActions.baseActions.updateBase(base));
    };
    useEffect(function () {
        if (newGame) {
            dispatch(allActions.boardActions.gameStart());
            initializeBase();
        }
        else if (isLoading) {
            checkBoard();
        }
        else if (turn === 'computer' && !newGame) {
            computersTurn();
        }
    }, [turn, newGame, possibleWordPositions]);
    return React.createElement("div", { className: 'gameboard-page-container' },
        React.createElement("div", { className: 'board-and-word-list' },
            React.createElement("div", { className: 'gameboard' },
                React.createElement(GameBoardHeader, null),
                isLoading ? React.createElement(LoadingTable, null)
                    : React.createElement(Board, { selectLetter: selectLetter }),
                React.createElement(GameBoardButtons, { newGame: showStartModal, resetGame: showResetModal, confirmSelection: confirmSelection, removeSelection: removeSelection })),
            React.createElement("div", { className: 'wordlist-and-info-container' },
                React.createElement(PlayedWordList, { timeTravel: timeTravel }),
                React.createElement(LogoContainer, null)),
            React.createElement("div", null,
                React.createElement(Message, { resetGame: resetGame, clearMessage: clearMessage, startNewGame: startNewGame }))));
};
