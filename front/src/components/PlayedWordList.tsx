import type React from "react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useWindowSize } from "../hooks/windowSize";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
import type { PlayerWordStyle } from "../types/types";
import { BalanceOfPower } from "./BalanceOfPower";

interface PlayedWordProps {
	timeTravel: (turn: number) => void;
	opponentName?: string;
	isMultiplayer?: boolean;
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {
	const { base, playerName, playedWords: played } = useSelector(selectBase);
	const { isLoading } = useSelector(selectBoard);
	const { opponentName, isMultiplayer } = props;
	
	// For multiplayer, opponent is the other player; for single player, it's "computer"
	const opponentIdentifier = isMultiplayer && opponentName ? opponentName : "computer";
	const playerNodes = base.filter((f) => f.owner === playerName).length;
	const comNodes = base.filter((f) => f.owner === opponentIdentifier).length;
	const percentageDifference = isLoading
		? 50
		: ((playerNodes - comNodes) / (playerNodes + comNodes / 2)) * 100 + 50;
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const size = useWindowSize();

	const getWordStyle = (owner: string): PlayerWordStyle => {
		return owner === opponentIdentifier
			? { color: "khaki", textAlign: "right" }
			: { color: "#87b6b8", textAlign: "left" };
	};

	const scrollToBottom = () => {
		if (size.width > 550 && messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [played]);

	return (
		<div className="wordListContainer">
			<BalanceOfPower
				playerPercentage={percentageDifference}
				playerName={playerName}
				opponentName={opponentIdentifier}
			/>
			<div className="wordListWords">
				{played.map((w, i) => {
					const styleValues = getWordStyle(w.owner);
					return (
						<span
							key={i}
							onClick={() => props.timeTravel(w.turn)}
							style={{
								color: styleValues.color,
								textAlign: styleValues.textAlign,
								cursor: "pointer",
								padding: "4px",
							}}
						>
							{w.word}
						</span>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};
