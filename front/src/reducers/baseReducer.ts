import { BaseState, letterObject }  from '../types/types'

const initialState: BaseState = {
    base: [],
    selection: []
  }

const baseReducer = (state = initialState, action: {type: string, payload: letterObject[]}) => {
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
        default: {
            return state
        }       
    }
}

export default baseReducer