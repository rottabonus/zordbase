import React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";

export const GameBoardHeader: React.FC = () => {
  const { turn, isLoading } = useSelector(selectBoard);
  const { selection: selected } = useSelector(selectBase);

  const headerMessage = turn.endsWith("s") ? `${turn}'s turn` : `${turn}s turn`;

  return (
    <div className="gameboard-header">
      {isLoading ? (
        <span>Generating Board</span>
      ) : selected.length ? (
        <span>{selected.map((s) => s.letter).join("")}</span>
      ) : (
        <span>{headerMessage}</span>
      )}
    </div>
  );
};
