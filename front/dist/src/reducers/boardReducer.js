import boardActions from "../actions/boardActions";
const initialState = {
    board: boardActions.createGameBoard(12, 10),
    newGame: true,
    turn: "player",
    isLoading: false,
};
const boardReducer = (state = initialState, action) => {
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
export const selectBoard = ({ board }) => board;
export default boardReducer;
