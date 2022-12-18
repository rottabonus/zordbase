import React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
export const Board = (props) => {
    const { board, turn } = useSelector(selectBoard);
    const { base, selection: selected, playerName } = useSelector(selectBase);
    const getLetterStyle = (r, c) => {
        const found = selected.filter((a) => a.row === r && a.column === c);
        const isSelected = found.length === 0 ? "none" : "selectedLetter";
        const cursorStyle = turn === "computer" ? "progress" : "pointer";
        const selectedWithOwner = selected.map((s) => ({
            row: s.row,
            column: s.column,
            letter: s.letter,
            owner: s.owner,
        }));
        const allSelected = selectedWithOwner.concat(base);
        const ownerArr = allSelected.filter((a) => a.row === r && a.column === c);
        const owner = ownerArr.length === 0 ? "none" : ownerArr[0].owner;
        const backgroundColor = owner === "computer" ? "khaki" : owner === playerName ? "#87b6b8" : null;
        return {
            class: isSelected,
            backgroundColor: backgroundColor,
            cursor: cursorStyle,
        };
    };
    return (React.createElement("div", null,
        React.createElement("table", null,
            React.createElement("tbody", null, board.map((row, i) => (React.createElement("tr", { key: i }, row.map((cellId, j) => {
                const styleValues = getLetterStyle(i, j);
                return (React.createElement("td", { className: styleValues.class, style: {
                        backgroundColor: styleValues.backgroundColor,
                        cursor: styleValues.cursor,
                    }, key: j, onClick: () => props.selectLetter(cellId, i, j, playerName) }, cellId));
            }))))))));
};
