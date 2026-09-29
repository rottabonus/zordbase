import type React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
import type { LetterStyle } from "../types/types";

interface BoardProps {
	selectLetter: (
		letter: string,
		row: number,
		column: number,
		owner: string,
	) => void;
	myUserId: string;
	opponentId?: string;
}

export const Board: React.FC<BoardProps> = (props) => {
	const { board, turn } = useSelector(selectBoard);
	const { base, selection: selected } = useSelector(selectBase);

	const getLetterStyle = (r: number, c: number): LetterStyle => {
		const found = selected.filter((a) => a.row === r && a.column === c);
		const isSelected = found.length === 0 ? "none" : "selectedLetter";
		const isComputerTurn = turn === "computer";
		const cursorStyle = isComputerTurn ? "progress" : "pointer";
		const selectedWithOwner = selected.map((s) => ({
			row: s.row,
			column: s.column,
			letter: s.letter,
			owner: s.owner,
		}));
		const allSelected = selectedWithOwner.concat(base);
		const ownerArr = allSelected.filter((a) => a.row === r && a.column === c);
		const owner = ownerArr.length === 0 ? "none" : ownerArr[0].owner;
		let backgroundColor = "transparent";
		if (owner === props.myUserId) {
			backgroundColor = "#87b6b8";
		} else if (owner === props.opponentId || owner === "computer") {
			backgroundColor = "khaki";
		}
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
					{board.map((row, rowIdx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: rowIdx/colIdx are stable board coordinates
						<tr key={`r${rowIdx}`}>
							{row.map((cellId, colIdx) => {
								const styleValues = getLetterStyle(rowIdx, colIdx);
								// Find actual owner from base
								const baseCell = base.find(
									(b) => b.row === rowIdx && b.column === colIdx,
								);
								const actualOwner = baseCell?.owner || "none";
								const cellKey = `c${rowIdx}-${colIdx}`;
								const handleClick = () =>
									props.selectLetter(cellId, rowIdx, colIdx, actualOwner);
								const handleKeyDown = (
									e: React.KeyboardEvent<HTMLButtonElement>,
								) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleClick();
									}
								};
								return (
									<td
										className={styleValues.class}
										style={{
											backgroundColor: styleValues.backgroundColor,
											cursor: styleValues.cursor,
										}}
										key={cellKey}
									>
										<button
											type="button"
											onClick={handleClick}
											onKeyDown={handleKeyDown}
											aria-label={`${cellId} at row ${rowIdx + 1}, column ${colIdx + 1}`}
											style={{
												background: "transparent",
												border: "none",
												padding: "0",
												width: "100%",
												height: "100%",
												cursor: "inherit",
											}}
										>
											{cellId}
										</button>
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
