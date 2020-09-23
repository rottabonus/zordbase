import { MessageState }  from '../types/types'

const initialState: MessageState = {
    message:'',
    type: '',
    show: false,
    resolution: false
  }

const messageReducer = (state = initialState, action: {type: string, payload: any}) => {
    switch(action.type){
        case "SETMESSAGE":
            return {
                ...state,
                message: action.payload.message,
                type: action.payload.type,
                show: true
            }
        case "CLEARMESSAGE":
            return {
                ...state,
                message: action.payload,
                type: '',
                show: false
            }
        case "RESOLVEMESSAGE":
            return {
                ...state,
                resolution: action.payload,
                message: '',
                show: false
            }
        default: {
            return state
        }       
    }
}

export default messageReducer