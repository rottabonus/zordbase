import React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
export const GameBoardHeader = () => {
    const { turn, isLoading } = useSelector(selectBoard);
    const { selection: selected } = useSelector(selectBase);
    const headerMessage = turn.endsWith("s") ? `${turn}'s turn` : `${turn}s turn`;
    return (React.createElement("div", { className: "gameboard-header" }, isLoading ? (React.createElement("span", null, "Generating Board")) : selected.length ? (React.createElement("span", null, selected.map((s) => s.letter).join(""))) : (React.createElement("span", null, headerMessage))));
};
