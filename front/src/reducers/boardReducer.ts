import { GameBoardState } from "../types/types";
import boardActions from "../actions/boardActions";
import { RootState } from "./combineReducer";

const initialState: GameBoardState = {
  board: boardActions.createGameBoard(12, 10),
  newGame: true,
  turn: "player",
  isLoading: false,
};

type Action =
  | {
      type: "NEWGAME";
      payload: GameBoardState;
    }
  | { type: "CREATEBOARD"; payload: string[][] }
  | { type: "CHANGETURN"; payload: string }
  | { type: "ISLOADING" | "GAMESTART"; payload: boolean };

const boardReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case "CREATEBOARD":
      return {
        ...state,
        board: action.payload,
      };
    case "NEWGAME":
      return {
        ...state,
        newGame: action.payload.newGame,
        board: action.payload.board,
        turn: action.payload.turn,
        isLoading: action.payload.isLoading,
      };
    case "CHANGETURN":
      return {
        ...state,
        turn: action.payload,
      };
    case "GAMESTART":
      return {
        ...state,
        newGame: action.payload,
      };
    case "ISLOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default: {
      return state;
    }
  }
};

export const selectBoard = ({ board }: RootState) => board;

export default boardReducer;
