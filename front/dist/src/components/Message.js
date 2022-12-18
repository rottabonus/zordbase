import React from "react";
import { useSelector } from "react-redux";
import { selectMessage } from "../reducers/messageReducer";
export const Message = (props) => {
    const { type: messageType, message, show } = useSelector(selectMessage);
    return show ? (React.createElement("div", { className: "modal" },
        React.createElement("div", { className: "modalText" },
            React.createElement("span", null, message)),
        messageType === "reset" ? (React.createElement("div", { className: "modalButtons" },
            React.createElement("div", null,
                React.createElement("span", { onClick: props.resetGame }, "Confirm")),
            React.createElement("div", null,
                React.createElement("span", { onClick: props.clearMessage }, "Cancel")))) : messageType === "start" ? (React.createElement("div", { className: "modalButtons" },
            React.createElement("div", null,
                React.createElement("span", { onClick: props.startNewGame }, "Confirm")),
            React.createElement("div", null,
                React.createElement("span", { onClick: props.clearMessage }, "Cancel")))) : (React.createElement("div", { className: "modalButtons" },
            React.createElement("div", null,
                React.createElement("span", { onClick: props.clearMessage }, "OK")))))) : null;
};
