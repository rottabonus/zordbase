var createBoard = function () {
    return {
        type: "CREATEBOARD",
        payload: createGameBoard(12, 10)
    };
};
var newGame = function (newGame, turn, isLoading) {
    return {
        type: "NEWGAME",
        payload: { newGame: newGame, board: createGameBoard(12, 10), turn: turn, isLoading: isLoading }
    };
};
var gameStart = function () {
    return {
        type: "GAMESTART",
        payload: false
    };
};
var isLoading = function (loading) {
    return {
        type: "ISLOADING",
        payload: loading
    };
};
var changeTurn = function (turn) {
    return {
        type: "CHANGETURN",
        payload: turn
    };
};
var createGameBoard = function (rows, columns) {
    var letters = 'aaaaaaaaaaaaiiiiiiiiiiittttttttttnnnnnnnnneeeeeeeesssssssslllllloooookkkkkuuuuuääääämmmmvvrrjjhhyyppdö';
    var letterArr = letters.split('');
    var board = [];
    var rowArray = [];
    for (var i = 0; i <= rows; i++) {
        if (i !== 0) {
            board.push(rowArray);
        }
        rowArray = [];
        for (var j = 0; j < columns; j++) {
            rowArray.push(letterArr[getRandomInt(letterArr.length)].toUpperCase());
        }
    }
    return board;
};
var getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
};
export default {
    createBoard: createBoard,
    newGame: newGame,
    changeTurn: changeTurn,
    createGameBoard: createGameBoard,
    gameStart: gameStart,
    isLoading: isLoading
};
