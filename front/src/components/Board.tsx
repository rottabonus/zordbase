import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reducers/combineReducer";
import { LetterStyle, letterObject } from "../types/types";

interface BoardProps {
  selectLetter: (L: string, row: number, column: number, owner: string) => void;
}

export const Board: React.FC<BoardProps> = (props) => {
  const board: string[][] = useSelector(
    (state: RootState) => state.board.board
  );
  const playerName: string = useSelector(
    (state: RootState) => state.base.playerName
  );
  const selected: letterObject[] = useSelector(
    (state: RootState) => state.base.selection
  );
  const turn: string = useSelector((state: RootState) => state.board.turn);
  const base: letterObject[] = useSelector(
    (state: RootState) => state.base.base
  );

  const getLetterStyle = (r: number, c: number): LetterStyle => {
    const found = selected.filter((a) => a.row === r && a.column === c);
    const isSelected = found.length === 0 ? "none" : "selectedLetter";
    const cursorStyle = turn === "computer" ? "progress" : "pointer";
    const selectedWithOwner: letterObject[] = selected.map((s) => ({
      row: s.row,
      column: s.column,
      letter: s.letter,
      owner: s.owner,
    }));
    const allSelected = selectedWithOwner.concat(base);
    const ownerArr = allSelected.filter((a) => a.row === r && a.column === c);
    const owner = ownerArr.length === 0 ? "none" : ownerArr[0].owner;
    const backgroundColor =
      owner === "computer" ? "khaki" : owner === playerName ? "#87b6b8" : null;
    return {
      class: isSelected,
      backgroundColor: backgroundColor,
      cursor: cursorStyle,
    };
  };

  return (
    <div>
      <table>
        <tbody>
          {board.map((row, i) => (
            <tr key={i}>
              {row.map((cellId, j) => {
                const styleValues = getLetterStyle(i, j);
                return (
                  <td
                    className={styleValues.class}
                    style={{
                      backgroundColor: styleValues.backgroundColor,
                      cursor: styleValues.cursor,
                    }}
                    key={j}
                    onClick={() => props.selectLetter(cellId, i, j, playerName)}
                  >
                    {cellId}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
