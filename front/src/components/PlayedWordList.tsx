import type React from "react";
import { useCallback, useEffect, useRef } from "react";
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
	myUserId?: string;
	opponentId?: string;
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {
	const { base, playerName, playedWords: played } = useSelector(selectBase);
	const { isLoading } = useSelector(selectBoard);
	const { opponentName, isMultiplayer, myUserId, opponentId } = props;

	const myIdentifier = isMultiplayer && myUserId ? myUserId : "player";
	const opponentIdentifier =
		isMultiplayer && opponentId ? opponentId : "computer";
	const playerNodes = base.filter((f) => f.owner === myIdentifier).length;
	const comNodes = base.filter((f) => f.owner === opponentIdentifier).length;
	const percentageDifference = isLoading
		? 50
		: ((playerNodes - comNodes) / (playerNodes + comNodes / 2)) * 100 + 50;
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const size = useWindowSize();

	const getWordStyle = (owner: string): PlayerWordStyle => {
		return owner === opponentIdentifier
			? { color: "khaki", textAlign: "right" }
			: { color: "#87b6b8", textAlign: "left" }; // My color (blue)
	};

	const scrollToBottom = useCallback(() => {
		if (size.width > 550 && messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [size.width]);

	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	return (
		<div className="wordListContainer">
			<BalanceOfPower
				playerPercentage={percentageDifference}
				playerName={playerName}
				opponentName={opponentName}
			/>
			<div className="wordListWords">
				{played.map((w, wordIndex) => {
					const styleValues = getWordStyle(w.owner);
					const handleClick = () => props.timeTravel(w.turn);
					const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleClick();
						}
					};
					return (
						<button
							// biome-ignore lint/suspicious/noArrayIndexKey: wordIndex is stable for played words list
							key={wordIndex}
							type="button"
							onClick={handleClick}
							onKeyDown={handleKeyDown}
							style={{
								color: styleValues.color,
								textAlign: styleValues.textAlign,
								padding: "4px",
								background: "transparent",
								border: "none",
								cursor: "pointer",
							}}
						>
							{w.word}
						</button>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
};
