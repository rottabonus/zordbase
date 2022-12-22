export const LETTERS =
  "aaaaaaaaaaaaiiiiiiiiiiittttttttttnnnnnnnnneeeeeeeesssssssslllllloooookkkkkuuuuuääääämmmmvvrrjjhhyyppdö".split(
    ""
  );

const createBoard = () => {
  return {
    type: "CREATEBOARD",
    payload: createGameBoard(12, 10),
  };
};

const newGame = (newGame: boolean, turn: string, isLoading: boolean) => {
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

const isLoading = (loading: boolean) => {
  return {
    type: "ISLOADING",
    payload: loading,
  };
};

const changeTurn = (turn: string) => {
  return {
    type: "CHANGETURN",
    payload: turn,
  };
};

const toArray = (num: number) => Array.from(Array(num).keys());

const createGameBoard = (rows: number, columns: number) => {
  return toArray(rows).map((_row) =>
    toArray(columns).map((_column) => getRandomFrom(LETTERS).toUpperCase())
  );
};

const getRandomFrom = (arr: Array<string>) => arr[getRandomInt(arr.length)];

const getRandomInt = (max: number) => {
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
