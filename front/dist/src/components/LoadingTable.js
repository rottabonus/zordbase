import React from "react";
export const LoadingTable = () => {
    const loadingBoard = [
        ["L", "O", "A", "D", "I", "N", "G", ".", ".", "."],
        ["C", "R", "E", "A", "T", "I", "N", "G", ".", "."],
        ["C", "A", "L", "C", "U", "L", "A", "T", "I", "N"],
        ["F", "I", "N", "A", "L", "I", "Z", "I", "N", "G"],
        ["V", "O", "C", "A", "L", "I", "Z", "I", "N", "G"],
        ["M", "E", "Z", "M", "E", "R", "I", "Z", "I", "N"],
        ["A", "D", "V", "I", "C", "I", "N", "G", ".", "."],
        ["H", "A", "R", "M", "O", "N", "I", "Z", "I", "N"],
        ["B", "U", "I", "L", "D", "I", "N", "G", ".", "."],
        ["F", "O", "R", "M", "A", "T", "I", "Z", "I", "N"],
        ["B", "A", "M", "B", "O", "O", "Z", "L", "I", "N"],
        ["G", "E", "T", " ", "R", "E", "A", "D", "Y", "."],
    ];
    return (React.createElement("div", null,
        React.createElement("table", null,
            React.createElement("tbody", null, loadingBoard.map((row, i) => (React.createElement("tr", { key: i }, row.map((cellId, j) => {
                return (React.createElement("td", { key: j, className: "spin" }, cellId));
            }))))))));
};
