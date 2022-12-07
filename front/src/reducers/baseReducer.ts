import { BaseState } from "../types/types";

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

const baseReducer = (
  state = initialState,
  action: { type: string; payload: any }
) => {
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

export default baseReducer;

