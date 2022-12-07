import React from "react";
import { useSelector } from "react-redux";
export var Board = function (props) {
    var board = useSelector(function (state) { return state.board.board; });
    var playerName = useSelector(function (state) { return state.base.playerName; });
    var selected = useSelector(function (state) { return state.base.selection; });
    var turn = useSelector(function (state) { return state.board.turn; });
    var base = useSelector(function (state) { return state.base.base; });
    var getLetterStyle = function (r, c) {
        var found = selected.filter(function (a) { return a.row === r && a.column === c; });
        var isSelected = found.length === 0 ? "none" : "selectedLetter";
        var cursorStyle = turn === "computer" ? "progress" : "pointer";
        var selectedWithOwner = selected.map(function (s) { return ({
            row: s.row,
            column: s.column,
            letter: s.letter,
            owner: s.owner,
        }); });
        var allSelected = selectedWithOwner.concat(base);
        var ownerArr = allSelected.filter(function (a) { return a.row === r && a.column === c; });
        var owner = ownerArr.length === 0 ? "none" : ownerArr[0].owner;
        var backgroundColor = owner === "computer" ? "khaki" : owner === playerName ? "#87b6b8" : null;
        return {
            class: isSelected,
            backgroundColor: backgroundColor,
            cursor: cursorStyle,
        };
    };
    return (React.createElement("div", null,
        React.createElement("table", null,
            React.createElement("tbody", null, board.map(function (row, i) { return (React.createElement("tr", { key: i }, row.map(function (cellId, j) {
                var styleValues = getLetterStyle(i, j);
                return (React.createElement("td", { className: styleValues.class, style: {
                        backgroundColor: styleValues.backgroundColor,
                        cursor: styleValues.cursor,
                    }, key: j, onClick: function () { return props.selectLetter(cellId, i, j, playerName); } }, cellId));
            }))); })))));
};
