import { GameBoardState }  from '../types/types'
import boardActions from '../actions/boardActions'

const initialState: GameBoardState = {
    board: boardActions.createGameBoard(8, 10),
    newGame: true,
    turn: 'player',
    isLoading: true
  }

const boardReducer = (state = initialState, action: {type: string, payload: any}) => {
    switch(action.type){
        case "CREATEBOARD":
            return {
                ...state,
                board: action.payload,
            }
        case "NEWGAME":
            return {
                ...state,
                newGame: action.payload.newGame,
                board: action.payload.board,
                turn: action.payload.turn,
                isLoading: action.payload.isLoading
            }
        case "CHANGETURN":
            return {
                ...state,
                turn: action.payload,
            }
        case "GAMESTART":
            return {
                ...state,
                newGame: action.payload        
            }
        case "HASLOADED":
            return {
                ...state,
                isLoading: action.payload        
                }
        default: {
            return state
        }       
    }
}

export default boardReducer