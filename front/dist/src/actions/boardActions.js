const createBoard = () => {
    return {
        type: "CREATEBOARD",
        payload: createGameBoard(12, 10),
    };
};
const newGame = (newGame, turn, isLoading) => {
    return {
        type: "NEWGAME",
        payload: { newGame, board: createGameBoard(12, 10), turn, isLoading },
    };
};
const gameStart = () => {
    return {
        type: "GAMESTART",
        payload: false,
    };
};
const isLoading = (loading) => {
    return {
        type: "ISLOADING",
        payload: loading,
    };
};
const changeTurn = (turn) => {
    return {
        type: "CHANGETURN",
        payload: turn,
    };
};
const createGameBoard = (rows, columns) => {
    const letters = "aaaaaaaaaaaaiiiiiiiiiiittttttttttnnnnnnnnneeeeeeeesssssssslllllloooookkkkkuuuuuääääämmmmvvrrjjhhyyppdö";
    const letterArr = letters.split("");
    const board = [];
    let rowArray = [];
    for (let i = 0; i <= rows; i++) {
        if (i !== 0) {
            board.push(rowArray);
        }
        rowArray = [];
        for (let j = 0; j < columns; j++) {
            rowArray.push(letterArr[getRandomInt(letterArr.length)].toUpperCase());
        }
    }
    return board;
};
const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
};
export default {
    createBoard,
    newGame,
    changeTurn,
    createGameBoard,
    gameStart,
    isLoading,
};
