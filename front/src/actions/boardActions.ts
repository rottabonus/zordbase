import { createGameBoard } from "../../../shared/boardLogic";

const createBoard = (board?: string[][]) => {
	return {
		type: "CREATEBOARD",
		payload: board || createGameBoard(12, 10),
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

export default {
	createBoard,
	newGame,
	changeTurn,
	createGameBoard,
	gameStart,
	isLoading,
};
