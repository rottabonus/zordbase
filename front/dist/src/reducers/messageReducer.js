const initialState = {
    message: "",
    type: "",
    show: false,
    resolution: false,
};
const messageReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SETMESSAGE":
            return {
                ...state,
                message: action.payload.message,
                type: action.payload.type,
                show: true,
            };
        case "CLEARMESSAGE":
            return {
                ...state,
                message: action.payload.message,
                type: "",
                show: false,
            };
        case "RESOLVEMESSAGE":
            return {
                ...state,
                resolution: action.payload.resolution,
                message: "",
                show: false,
            };
        default: {
            return state;
        }
    }
};
export const selectMessage = ({ message }) => message;
export default messageReducer;
