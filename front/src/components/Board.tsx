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
		// Check if it's computer's turn (single player) or opponent's turn (multiplayer)
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
		if (owner === "computer") {
			backgroundColor = "khaki";
		} else if (owner === props.myUserId) {
			backgroundColor = "#87b6b8"; // Current player - blue
		} else if (owner === props.opponentId) {
			backgroundColor = "#f4a261"; // Opponent - orange/sand
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
					{board.map((row, i) => (
						<tr key={i}>
							{row.map((cellId, j) => {
								const styleValues = getLetterStyle(i, j);
								// Find actual owner from base
								const baseCell = base.find(
									(b) => b.row === i && b.column === j,
								);
								const actualOwner = baseCell?.owner || "none";
								return (
									<td
										className={styleValues.class}
										style={{
											backgroundColor: styleValues.backgroundColor,
											cursor: styleValues.cursor,
										}}
										key={j}
										onClick={() => props.selectLetter(cellId, i, j, actualOwner)}
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
