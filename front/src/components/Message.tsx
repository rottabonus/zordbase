import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reducers/combineReducer";

interface MessageProps {
  resetGame: () => void;
  clearMessage: () => void;
  startNewGame: () => void;
}

export const Message: React.FC<MessageProps> = (props) => {
  const messageState = useSelector((state: RootState) => state.message);

  return messageState.show ? (
    <div className="modal">
      <div className="modalText">
        <span>{messageState.message}</span>
      </div>

      {messageState.type === "reset" ? (
        <div className="modalButtons">
          <div>
            <span onClick={props.resetGame}>Confirm</span>
          </div>
          <div>
            <span onClick={props.clearMessage}>Cancel</span>
          </div>
        </div>
      ) : messageState.type === "start" ? (
        <div className="modalButtons">
          <div>
            <span onClick={props.startNewGame}>Confirm</span>
          </div>
          <div>
            <span onClick={props.clearMessage}>Cancel</span>
          </div>
        </div>
      ) : (
        <div className="modalButtons">
          <div>
            <span onClick={props.clearMessage}>OK</span>
          </div>
        </div>
      )}
    </div>
  ) : null;
};
