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

	// Multiplayer passes playerName/opponentName/isMyTurn; singleplayer passes
	// none of them and falls back to the shared `turn` state (player name or
	// "computer").
	const currentPlayer =
		opponentName && playerName ? (isMyTurn ? playerName : opponentName) : turn;
	const turnMessage = currentPlayer.endsWith("s")
		? `${currentPlayer}'s turn`
		: `${currentPlayer}s turn`;

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
};
