import { MessageState } from "../types/types";
import { RootState } from "./combineReducer";

const initialState: MessageState = {
  message: "",
  type: "",
  show: false,
  resolution: false,
};

type Action =
  | {
      type: "SETMESSAGE" | "CLEARMESSAGE";
      payload: Omit<MessageState, "resolution">;
    }
  | { type: "RESOLVEMESSAGE"; payload: Omit<MessageState, "type"> };

const messageReducer = (state = initialState, action: Action) => {
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
        message: action.payload,
        type: "",
        show: false,
      };
    case "RESOLVEMESSAGE":
      return {
        ...state,
        resolution: action.payload,
        message: "",
        show: false,
      };
    default: {
      return state;
    }
  }
};

export const selectMessage = ({ message }: RootState) => message;

export default messageReducer;
