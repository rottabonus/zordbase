import { BaseState, letterObject }  from '../types/types'

const initialState: BaseState = {
    base: [],
    selection: []
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
        case "UPDATESELECTION":
            return {
                ...state,
                selection: action.payload,   
                }
        case "REMOVEFROMSELECTION":
            return {
                ...state,
                selection: state.selection.slice(0, action.payload)
            }
        default: {
            return state
        }       
    }
}

export default baseReducer