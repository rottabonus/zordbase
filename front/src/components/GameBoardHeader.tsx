import type React from "react";
import { useSelector } from "react-redux";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";

interface GameBoardHeaderProps {
	playerName?: string;
	opponentName?: string;
	isMyTurn?: boolean;
	gameStatus?: "waiting" | "playing" | "finished";
}

export const GameBoardHeader: React.FC<GameBoardHeaderProps> = (props) => {
	const { turn, isLoading } = useSelector(selectBoard);
	const { selection: selected } = useSelector(selectBase);
	const { playerName, opponentName, isMyTurn, gameStatus } = props;

	const headerMessage = turn.endsWith("s") ? `${turn}'s turn` : `${turn}s turn`;

	if (gameStatus === "finished") {
		return (
			<div className="gameboard-header">
				<span>Game Finished</span>
			</div>
		);
	}

	if (gameStatus === "waiting") {
		return (
			<div className="gameboard-header">
				<span>Waiting for opponent...</span>
			</div>
		);
	}

	// Multiplayer mode with opponent name
	if (opponentName && playerName) {
		const currentPlayer = isMyTurn ? playerName : opponentName;
		const turnMessage = `${currentPlayer}'s turn`;
		
		return (
			<div className="gameboard-header">
				{isLoading ? (
					<span>Generating Board</span>
				) : selected.length ? (
					<span>{selected.map((s) => s.letter).join("")}</span>
				) : (
					<span>{turnMessage}</span>
				)}
			</div>
		);
	}

	// Single player mode (vs computer)
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
