import { GameBoardState }  from '../types/types'
import wordService from '../services/words'

const initialState: GameBoardState = {
    board: wordService.createBoard(8, 10)
  }

const boardReducer = (state = initialState, action: {type: string, payload: string[][]}) => {
    switch(action.type){
        case "CREATEBOARD":
            return {
                ...state,
                board: action.payload,
            }
        default: {
            return state
        }       
    }
}

export default boardReducer