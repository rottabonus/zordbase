import React from 'react';
import { useSelector } from 'react-redux';
export var GameBoardButtons = function (props) {
    var board = useSelector(function (state) { return state.board.board; });
    var selected = useSelector(function (state) { return state.base.selection; });
    var isLoading = useSelector(function (state) { return state.board.isLoading; });
    var getButtonStyle = function () {
        return selected.length ? { visibility: 'visible', cursor: 'pointer' } : { visibility: 'hidden', cursor: 'auto' };
    };
    var getButtonStyleLoading = function () {
        return isLoading ? { visibility: 'hidden', cursor: 'auto' } : { visibility: 'visible', cursor: 'pointer' };
    };
    var buttonStyles = getButtonStyle();
    var buttonStylesLoading = getButtonStyleLoading();
    return React.createElement("div", { className: 'gameboard-button-div' },
        React.createElement("div", { className: 'gameboard-button' },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-plus-circle", onClick: function () { return props.newGame(); }, style: { visibility: buttonStylesLoading.visibility, cursor: buttonStylesLoading.cursor } })),
            isLoading ? null : React.createElement("span", { className: 'helptext' }, "New game")),
        React.createElement("div", { className: 'gameboard-button' },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-chevron-circle-down", onClick: function () { return props.confirmSelection(); }, style: { visibility: buttonStyles.visibility, cursor: buttonStyles.cursor } })),
            selected.length ? React.createElement("span", { className: 'helptext' }, "Confirm selection") : null),
        React.createElement("div", { className: 'gameboard-button' },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-times-circle-o", onClick: function () { return props.removeSelection(); }, style: { visibility: buttonStyles.visibility, cursor: buttonStyles.cursor } })),
            selected.length ? React.createElement("span", { className: 'helptext' }, "Remove selection") : null),
        React.createElement("div", { className: 'gameboard-button' },
            React.createElement("span", null,
                React.createElement("i", { className: "fa fa-refresh", "aria-hidden": "true", onClick: function () { return props.resetGame(board); }, style: { visibility: buttonStylesLoading.visibility, cursor: buttonStylesLoading.cursor } })),
            isLoading ? null : React.createElement("span", { className: 'helptext' }, "Reset game")));
};
