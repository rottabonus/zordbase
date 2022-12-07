import React from 'react';
import { useSelector } from 'react-redux';
export var GameBoardHeader = function () {
    var turn = useSelector(function (state) { return state.board.turn; });
    var isLoading = useSelector(function (state) { return state.board.isLoading; });
    var selected = useSelector(function (state) { return state.base.selection; });
    var headerMessage = turn.endsWith('s') ? turn + "'s turn" : turn + "s turn";
    return React.createElement("div", { className: 'gameboard-header' }, isLoading ? React.createElement("span", null, "Generating Board") : selected.length ? React.createElement("span", null, selected.map(function (s) { return s.letter; }).join('')) : React.createElement("span", null, headerMessage));
};
