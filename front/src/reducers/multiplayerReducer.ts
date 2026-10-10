import type { GameState } from "../types/types";
import type { RootState } from "./combineReducer";

export interface MultiplayerState {
	gameState: GameState | null;
	isConnected: boolean;
	error: string | null;
}

const initialState: MultiplayerState = {
	gameState: null,
	isConnected: false,
	error: null,
};

type Action =
	| { type: "SET_GAME_STATE"; payload: GameState }
	| { type: "UPDATE_GAME_STATE"; payload: Partial<GameState> }
	| { type: "SET_CONNECTED"; payload: boolean }
	| { type: "SET_ERROR"; payload: string | null }
	| { type: "CLEAR_GAME_STATE" };

const multiplayerReducer = (
	state = initialState,
	action: Action,
): MultiplayerState => {
	switch (action.type) {
		case "SET_GAME_STATE":
			return {
				...state,
				gameState: action.payload,
				isConnected: true,
				error: null,
			};
		case "UPDATE_GAME_STATE":
			return {
				...state,
				gameState: state.gameState
					? { ...state.gameState, ...action.payload }
					: null,
			};
		case "SET_CONNECTED":
			return {
				...state,
				isConnected: action.payload,
			};
		case "SET_ERROR":
			return {
				...state,
				error: action.payload,
			};
		case "CLEAR_GAME_STATE":
			return {
				...state,
				gameState: null,
				isConnected: false,
				error: null,
			};
		default:
			return state;
	}
};

export const selectMultiplayer = ({ multiplayer }: RootState) => multiplayer;

export default multiplayerReducer;
