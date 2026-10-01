import type { GameState } from "../types/types";

const setGameState = (gameState: GameState) => {
	return {
		type: "SET_GAME_STATE",
		payload: gameState,
	};
};

const updateGameState = (partialState: Partial<GameState>) => {
	return {
		type: "UPDATE_GAME_STATE",
		payload: partialState,
	};
};

const setConnected = (connected: boolean) => {
	return {
		type: "SET_CONNECTED",
		payload: connected,
	};
};

const setError = (error: string | null) => {
	return {
		type: "SET_ERROR",
		payload: error,
	};
};

const clearGameState = () => {
	return {
		type: "CLEAR_GAME_STATE",
	};
};

export default {
	setGameState,
	updateGameState,
	setConnected,
	setError,
	clearGameState,
};