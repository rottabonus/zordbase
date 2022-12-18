import React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
export const GameBoardButtons = (props) => {
    const { board, isLoading } = useSelector(selectBoard);
    const { selection: selected } = useSelector(selectBase);
    const getButtonStyle = () => {
        return selected.length
            ? { visibility: "visible", cursor: "pointer" }
            : { visibility: "hidden", cursor: "auto" };
    };
    const getButtonStyleLoading = () => {
        return isLoading
            ? { visibility: "hidden", cursor: "auto" }
            : { visibility: "visible", cursor: "pointer" };
    };
    const buttonStyles = getButtonStyle();
    const buttonStylesLoading = getButtonStyleLoading();
    return (React.createElement("div", { className: "gameboard-button-div" },
        React.createElement("div", { className: "gameboard-button" },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-plus-circle", onClick: () => props.newGame(), style: {
                        visibility: buttonStylesLoading.visibility,
                        cursor: buttonStylesLoading.cursor,
                    } })),
            isLoading ? null : React.createElement("span", { className: "helptext" }, "New game")),
        React.createElement("div", { className: "gameboard-button" },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-chevron-circle-down", onClick: () => props.confirmSelection(), style: {
                        visibility: buttonStyles.visibility,
                        cursor: buttonStyles.cursor,
                    } })),
            selected.length ? (React.createElement("span", { className: "helptext" }, "Confirm selection")) : null),
        React.createElement("div", { className: "gameboard-button" },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-times-circle-o", onClick: () => props.removeSelection(), style: {
                        visibility: buttonStyles.visibility,
                        cursor: buttonStyles.cursor,
                    } })),
            selected.length ? (React.createElement("span", { className: "helptext" }, "Remove selection")) : null),
        React.createElement("div", { className: "gameboard-button" },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-refresh", "aria-hidden": "true", onClick: () => props.resetGame(board), style: {
                        visibility: buttonStylesLoading.visibility,
                        cursor: buttonStylesLoading.cursor,
                    } })),
            isLoading ? null : React.createElement("span", { className: "helptext" }, "Reset game"))));
};
