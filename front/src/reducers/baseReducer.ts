import { BaseState, letterObject, playedWord, Turn } from "../types/types";
import { RootState } from "./combineReducer";

const initialState: BaseState = {
  base: [],
  selection: [],
  playedWords: [],
  playerName: "player",
  possibleWordPositions: {},
  stateHistory: [
    {
      base: [],
      selection: [],
      turn: "",
    },
  ],
};

type Action =
  | {
      type: "CREATEBASE";
      payload: {
        base: letterObject[];
        possibleWordPositions: Record<string, string[]>;
      };
    }
  | {
      type: "UPDATEBASE";
      payload: letterObject[];
    }
  | {
      type: "UPDATESELECTION";
      payload: letterObject[];
    }
  | { type: "REMOVEFROMSELECTION"; payload: number }
  | { type: "UPDATEPLAYEDWORDS"; payload: playedWord[] }
  | {
      type: "CONFIRMSELECTION";
      payload: {
        selection: letterObject[];
        base: letterObject[];
        played: playedWord[];
      };
    }
  | { type: "CHANGEPLAYERNAME"; payload: string }
  | {
      type: "RESETGAME";
      payload: {
        base: letterObject[];
        selection: letterObject[];
        played: playedWord[];
        history: Turn;
      };
    }
  | {
      type: "REMOVESELECTIONANDPLAYED";
      payload: {
        selection: letterObject[];
        played: playedWord[];
        history: Turn;
      };
    }
  | { type: "CREATEHISTORY"; payload: Turn };

const baseReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case "CREATEBASE":
      return {
        ...state,
        base: action.payload.base,
        possibleWordPositions: action.payload.possibleWordPositions,
      };
    case "UPDATEBASE":
      return {
        ...state,
        base: action.payload,
      };
    case "UPDATESELECTION":
      return {
        ...state,
        selection: action.payload,
      };
    case "UPDATEPLAYEDWORDS":
      return {
        ...state,
        playedWords: action.payload,
      };
    case "REMOVEFROMSELECTION":
      return {
        ...state,
        selection: state.selection.slice(0, action.payload),
      };
    case "CONFIRMSELECTION":
      return {
        ...state,
        selection: action.payload.selection,
        base: action.payload.base,
        playedWords: action.payload.played,
      };
    case "CHANGEPLAYERNAME":
      return {
        ...state,
        playerName: action.payload,
      };
    case "RESETGAME":
      return {
        ...state,
        base: action.payload.base,
        selection: action.payload.selection,
        playedWords: action.payload.played,
        stateHistory: [action.payload.history],
      };
    case "REMOVESELECTIONANDPLAYED":
      return {
        ...state,
        selection: action.payload.selection,
        playedWords: action.payload.played,
        stateHistory: [action.payload.history],
      };
    case "CREATEHISTORY":
      return {
        ...state,
        stateHistory: [
          ...state.stateHistory,
          {
            base: action.payload.base,
            selection: action.payload.selection,
            turn: action.payload.turn,
          },
        ],
      };
    default: {
      return state;
    }
  }
};

export const selectBase = ({ base }: RootState) => base;

export default baseReducer;
