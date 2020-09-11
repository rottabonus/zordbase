import { BaseState }  from '../types/types'

const initialState: BaseState = {
    base: [],
    selection: [],
    playedWords: []
  }

const baseReducer = (state = initialState, action: {type: string, payload: any}) => {
    switch(action.type){
        case "UPDATEBASE":
            return {
                ...state,
                base: action.payload,
            }
        case "UPDATESELECTION":
            return {
                ...state,
                selection: action.payload,
                
            }
        case "UPDATEPLAYEDWORDS":
            return {
                ...state,
                playedWords: action.payload,   
                }
        case "REMOVEFROMSELECTION":
            return {
                ...state,
                selection: state.selection.slice(0, action.payload)
            }
        case "CONFIRMSELECTION":
            return {
                ...state,
                selection: action.payload.selection,
                base: action.payload.base,
                playedWords: action.payload.played
            }
        default: {
            return state
        }       
    }
}

export default baseReducer