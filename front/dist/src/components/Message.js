import React from 'react';
import { useSelector } from 'react-redux';
export var Message = function (props) {
    var messageState = useSelector(function (state) { return state.message; });
    return messageState.show ?
        React.createElement("div", { className: 'modal' },
            React.createElement("div", { className: 'modalText' },
                React.createElement("span", null, messageState.message)),
            messageState.type === 'reset' ?
                React.createElement("div", { className: 'modalButtons' },
                    React.createElement("div", null,
                        React.createElement("span", { onClick: props.resetGame }, "Confirm")),
                    React.createElement("div", null,
                        React.createElement("span", { onClick: props.clearMessage }, "Cancel")))
                :
                    messageState.type === 'start' ?
                        React.createElement("div", { className: 'modalButtons' },
                            React.createElement("div", null,
                                React.createElement("span", { onClick: props.startNewGame }, "Confirm")),
                            React.createElement("div", null,
                                React.createElement("span", { onClick: props.clearMessage }, "Cancel")))
                        :
                            React.createElement("div", { className: 'modalButtons' },
                                React.createElement("div", null,
                                    React.createElement("span", { onClick: props.clearMessage }, "OK")))) : null;
};
