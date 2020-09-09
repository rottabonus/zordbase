import { GameBoardState }  from '../types/types'
import wordService from '../services/words'

const initialState: GameBoardState = {
    board: wordService.createBoard(8, 10),
    newGame: true,
    turn: 'player1'
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
                newGame: action.payload,
            }
        case "CHANGETURN":
            return {
                ...state,
                turn: action.payload,
            }
        default: {
            return state
        }       
    }
}

export default boardReducer