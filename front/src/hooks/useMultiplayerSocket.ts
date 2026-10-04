import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { Socket } from "socket.io-client";
import type {
	GameState,
	GameMove,
	GameEndData,
	GameServerToClientEvents,
	GameClientToServerEvents,
	letterObject,
} from "../types/types";
import allActions from "../actions/allActions";
import { selectBase } from "../reducers/baseReducer";
import { selectMultiplayer } from "../reducers/multiplayerReducer";
import gameService from "../services/game";

interface UseMultiplayerSocketOptions {
	socket: Socket<GameServerToClientEvents, GameClientToServerEvents>;
	gameId: string | undefined;
	myUserId: string;
	initializeBaseFromServer: (serverBase: letterObject[]) => void;
}

interface UseMultiplayerSocketReturn {
	opponentId: string;
	opponentName: string;
	gameStatus: "waiting" | "playing" | "finished";
	isMyTurn: boolean;
	error: string | null;
	computerSelect: (selection: letterObject[]) => void;
	setOpponentId: React.Dispatch<React.SetStateAction<string>>;
	setOpponentName: React.Dispatch<React.SetStateAction<string>>;
	setGameStatus: React.Dispatch<
		React.SetStateAction<"waiting" | "playing" | "finished">
	>;
	setIsMyTurn: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useMultiplayerSocket = ({
	socket,
	gameId,
	myUserId,
	initializeBaseFromServer,
}: UseMultiplayerSocketOptions): UseMultiplayerSocketReturn => {
	const dispatch = useDispatch();
	const { gameState, error: multiplayerError } = useSelector(selectMultiplayer);
	const { stateHistory, base, playedWords } = useSelector(selectBase);

	const [opponentId, setOpponentId] = useState<string>("");
	const [opponentName, setOpponentName] = useState<string>("");
	const [gameStatus, setGameStatus] = useState<
		"waiting" | "playing" | "finished"
	>("waiting");
	const [isMyTurn, setIsMyTurn] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const computerSelect = useCallback(
		(selection: letterObject[]) => {
			for (const [i, _s] of selection.entries()) {
				const selectionArray = selection.filter((_s, j) => j <= i);
				setTimeout(
					() => {
						dispatch(allActions.baseActions.updateSelection(selectionArray));
					},
					(i + 1) * 500,
				);
			}
		},
		[dispatch],
	);

	useEffect(() => {
		if (!gameId) return;

		const handleGameState = (state: GameState) => {
			console.log("Received game state", state);
			dispatch(allActions.multiplayerActions.setGameState(state));
			dispatch(allActions.multiplayerActions.setConnected(true));

			const opponentIdFound = state.players.find((p) => p !== myUserId) || "";
			setOpponentId(opponentIdFound);
			setOpponentName(state.playerNames[opponentIdFound] || "Opponent");
			setGameStatus(state.status);

			const isMyTurnNow = state.turn === myUserId;
			setIsMyTurn(isMyTurnNow);

			const myUsername = state.playerNames[myUserId] || "You";
			const opponentIdFound2 = state.players.find((p) => p !== myUserId) || "";
			const opponentUsername =
				state.playerNames[opponentIdFound2] || "Opponent";

			dispatch(allActions.baseActions.changePlayerName(myUsername));

			if (state.status === "finished" && state.winner) {
				const winnerName = state.winner === myUserId ? "You" : opponentUsername;
				dispatch(
					allActions.messageActions.setMessage(
						`Game over! ${winnerName} won!`,
						"message",
					),
				);
			}

			dispatch(allActions.boardActions.createBoard(state.board));
			dispatch(
				allActions.boardActions.newGame(
					false,
					isMyTurnNow ? myUsername : opponentUsername,
					false,
				),
			);
			dispatch(allActions.boardActions.gameStart());

			const initialHistory = {
				base: state.base,
				selection: [],
				turn: isMyTurnNow ? myUsername : opponentUsername,
			} as const;
			dispatch(
				allActions.baseActions.createHistory(
					initialHistory.base,
					[],
					initialHistory.turn,
				),
			);

			initializeBaseFromServer(state.base);
		};

		const handleGameMove = (move: GameMove) => {
			console.log("Received game move", move);
			dispatch(
				allActions.multiplayerActions.updateGameState({
					base: move.newBase,
					playedWords: move.playedWords,
					turn: move.nextTurn,
					winner: move.winner,
				}),
			);

			const nextIsMyTurn = move.nextTurn === myUserId;
			setIsMyTurn(nextIsMyTurn);

			const currentPlayerNames = gameState?.playerNames || {};
			const myUsername = currentPlayerNames[myUserId] || "You";
			const currentPlayers = gameState?.players || ["", ""];
			const opponentIdFound = currentPlayers.find((p) => p !== myUserId) || "";
			const opponentUsername =
				currentPlayerNames[opponentIdFound] || "Opponent";

			if (move.winner) {
				setGameStatus("finished");
				const winnerName = move.winner === myUserId ? "You" : opponentUsername;
				dispatch(
					allActions.messageActions.setMessage(
						`Game over! ${winnerName} won with "${move.word}"!`,
						"message",
					),
				);
				return;
			}

			// Create history entry for opponent's move (using pre-move base from history)
			const movePlayerName =
				move.playerId === myUserId ? myUsername : opponentUsername;
			const preMoveBase = stateHistory[stateHistory.length - 1]?.base || base;
			dispatch(
				allActions.baseActions.createHistory(
					preMoveBase,
					move.selection,
					movePlayerName,
				),
			);

			// Visualize opponent's move when it becomes our turn (after opponent finishes)
			if (nextIsMyTurn) {
				computerSelect(move.selection);
				// Delay confirmSelection until after animation completes
				// Animation duration: selection.length * 500 + 700 (same as computerSelect)
				const animationDuration = move.selection.length * 500 + 700;
				setTimeout(() => {
					dispatch(
						allActions.baseActions.confirmSelection(
							move.newBase,
							move.playedWords,
							[],
						),
					);
					dispatch(
						allActions.boardActions.changeTurn(
							nextIsMyTurn ? myUsername : opponentUsername,
						),
					);
				}, animationDuration);
			} else {
				// Opponent's move, it's now their turn - apply immediately
				dispatch(
					allActions.baseActions.confirmSelection(
						move.newBase,
						move.playedWords,
						[],
					),
				);
				dispatch(
					allActions.boardActions.changeTurn(
						nextIsMyTurn ? myUsername : opponentUsername,
					),
				);
			}
		};

		const handleGameEnd = (data: GameEndData) => {
			console.log("Game ended", data);
			setGameStatus("finished");

			dispatch(
				allActions.multiplayerActions.updateGameState({
					status: "finished",
					winner: data.winner,
				}),
			);

			const currentPlayerNames = gameState?.playerNames || {};
			const currentPlayers = gameState?.players || ["", ""];
			const opponentIdFound = currentPlayers.find((p) => p !== myUserId) || "";
			const opponentUsername =
				currentPlayerNames[opponentIdFound] || "Opponent";

			const winnerName = data.winner === myUserId ? "You" : opponentUsername;
			let message = `Game over! ${winnerName} won!`;
			if (data.reason === "disconnect") {
				message = `Game over! ${winnerName} won by forfeit (opponent disconnected).`;
			}
			dispatch(allActions.messageActions.setMessage(message, "message"));
		};

		const handleGameError = (err: string) => {
			console.error("Game error", err);
			setError(err);
			dispatch(allActions.multiplayerActions.setError(err));
			dispatch(allActions.messageActions.setMessage(err, "message"));
		};

		socket.on("game:state", handleGameState);
		socket.on("game:move", handleGameMove);
		socket.on("game:end", handleGameEnd);
		socket.on("game:error", handleGameError);

		return () => {
			socket.off("game:state", handleGameState);
			socket.off("game:move", handleGameMove);
			socket.off("game:end", handleGameEnd);
			socket.off("game:error", handleGameError);
		};
	}, [
		gameId,
		myUserId,
		dispatch,
		initializeBaseFromServer,
		gameState,
		stateHistory,
		base,
		playedWords,
		computerSelect,
	]);

	return {
		opponentId,
		opponentName,
		gameStatus,
		isMyTurn,
		error,
		computerSelect,
		setOpponentId,
		setOpponentName,
		setGameStatus,
		setIsMyTurn,
		setError,
	};
};
