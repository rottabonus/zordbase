import { PlayedWordState, playedWord }  from '../types/types'

const initialState: PlayedWordState = {
    playedWords: []
  }

const playedWordReducer = (state = initialState, action: {type: string, payload: playedWord[]}) => {
    switch(action.type){
        case "UPDATEPLAYED":
            return {
                ...state,
                playedWords: action.payload,
            }
        default: {
            return state
        }       
    }
}

export default playedWordReducer