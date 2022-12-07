import React from "react";
import { useSelector } from "react-redux";
import { selectMessage } from "../reducers/messageReducer";

interface MessageProps {
  resetGame: () => void;
  clearMessage: () => void;
  startNewGame: () => void;
}

export const Message: React.FC<MessageProps> = (props) => {
  const { type: messageType, message, show } = useSelector(selectMessage);

  return show ? (
    <div className="modal">
      <div className="modalText">
        <span>{message}</span>
      </div>

      {messageType === "reset" ? (
        <div className="modalButtons">
          <div>
            <span onClick={props.resetGame}>Confirm</span>
          </div>
          <div>
            <span onClick={props.clearMessage}>Cancel</span>
          </div>
        </div>
      ) : messageType === "start" ? (
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
