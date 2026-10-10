import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import allActions from "../actions/allActions";
import { useSocket } from "../contexts/SocketContext";
import { selectBase } from "../reducers/baseReducer";
import { selectMultiplayer } from "../reducers/multiplayerReducer";
import { storageService } from "../services/storageService";
import type {
	GameEndData,
	GameMove,
	GameState,
	letterObject,
} from "../types/types";
import { ClientGameMoveSchema, GameIdSchema } from "../validation/schemas";
import {
	emitValidated,
	parseGameEnd,
	parseGameErrorMessage,
	parseGameMove,
	parseGameState,
} from "../validation/socketValidators";
import { useAnimatedMove } from "./useAnimatedMove";
import { useSelectionAnimator } from "./useSelectionAnimator";

interface UseMultiplayerGameOptions {
	gameId: string | undefined;
	initializeBaseFromServer: (serverBase: letterObject[]) => void;
}

interface UseMultiplayerGameReturn {
	opponentId: string;
	opponentName: string;
	gameStatus: "waiting" | "playing" | "finished";
	isMyTurn: boolean;
	error: string | null;
	myUserId: string;
	myUsername: string;
	computerSelect: (selection: letterObject[]) => void;
	joinGame: () => void;
	makeMove: (
		gameId: string,
		selection: letterObject[],
		word: string,
		preMoveBase?: letterObject[],
	) => void;
}

export const useMultiplayerGame = ({
	gameId,
	initializeBaseFromServer,
}: UseMultiplayerGameOptions): UseMultiplayerGameReturn => {
	const { socket, isConnected } = useSocket();
	const dispatch = useDispatch();
	const { gameState } = useSelector(selectMultiplayer);
	const { stateHistory, base } = useSelector(selectBase);

	const [myUserId, setMyUserId] = useState<string>("");
	const [myUsername, setMyUsername] = useState<string>("");
	const [opponentId, setOpponentId] = useState<string>("");
	const [opponentName, setOpponentName] = useState<string>("");
	const [gameStatus, setGameStatus] = useState<
		"waiting" | "playing" | "finished"
	>("waiting");
	const [isMyTurn, setIsMyTurn] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Refs for current values (to avoid stale closures in event handlers)
	const myUserIdRef = useRef(myUserId);
	const myUsernameRef = useRef(myUsername);
	const gameStateRef = useRef(gameState);
	const stateHistoryRef = useRef(stateHistory);
	const baseRef = useRef(base);
	const gameIdRef = useRef(gameId);
	const ourMovePreBaseRef = useRef<letterObject[] | null>(null);

	useEffect(() => {
		myUserIdRef.current = myUserId;
	}, [myUserId]);
	useEffect(() => {
		myUsernameRef.current = myUsername;
	}, [myUsername]);
	useEffect(() => {
		gameStateRef.current = gameState;
	}, [gameState]);
	useEffect(() => {
		stateHistoryRef.current = stateHistory;
	}, [stateHistory]);
	useEffect(() => {
		baseRef.current = base;
	}, [base]);
	useEffect(() => {
		gameIdRef.current = gameId;
	}, [gameId]);

	const computerSelect = useSelectionAnimator();
	const applyMove = useAnimatedMove();

	// Session restore handler
	const handleSessionRestore = useCallback(
		(parsed: { userID: string; username: string; sessionID: string }) => {
			console.log("onSessionRestore called", parsed);
			setMyUserId(parsed.userID);
			setMyUsername(parsed.username || "Player");
		},
		[],
	);

	// Handle game events - register once when socket connects
	useEffect(() => {
		if (!socket || !gameIdRef.current) return;

		const handleGameState = (data: unknown) => {
			const parsed = parseGameState(data);
			if (!parsed.success || !parsed.data) {
				console.error(parsed.error);
				return;
			}
			const state = parsed.data as GameState;
			console.log("Received game state", {
				state,
				myUserId: myUserIdRef.current,
			});
			dispatch(allActions.multiplayerActions.setGameState(state));
			dispatch(allActions.multiplayerActions.setConnected(true));

			const myUserId = myUserIdRef.current;
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
			myUsernameRef.current = myUsername;

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

		const handleGameMove = (data: unknown) => {
			const parsed = parseGameMove(data);
			if (!parsed.success || !parsed.data) {
				console.error(parsed.error);
				return;
			}
			const move = parsed.data as GameMove;
			console.log("Received game move", move);

			const myUserId = myUserIdRef.current;
			const myUsername = myUsernameRef.current;
			const gameState = gameStateRef.current;

			const nextIsMyTurn = move.nextTurn === myUserId;
			setIsMyTurn(nextIsMyTurn);

			const currentPlayerNames = gameState?.playerNames || {};
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
				dispatch(
					allActions.multiplayerActions.updateGameState({
						base: move.newBase,
						playedWords: move.playedWords,
						turn: move.nextTurn,
						winner: move.winner,
					}),
				);
				return;
			}

			// Create history entry for the move
			const movePlayerName =
				move.playerId === myUserId ? myUsername : opponentUsername;
			// Use pre-move base for history (for our moves, we stored it before sending)
			const preMoveBase =
				move.playerId === myUserId
					? (ourMovePreBaseRef.current ?? baseRef.current)
					: baseRef.current;
			// Clear after use
			if (move.playerId === myUserId) {
				ourMovePreBaseRef.current = null;
			}

			// Server-authoritative: ALWAYS visualize first, then apply state
			// This applies to BOTH our moves (echoed back) and opponent's moves
			applyMove({
				preMoveBase,
				selection: move.selection,
				historyTurnLabel: movePlayerName,
				newBase: move.newBase,
				playedWords: move.playedWords,
				onComplete: () => {
					dispatch(
						allActions.multiplayerActions.updateGameState({
							base: move.newBase,
							playedWords: move.playedWords,
							turn: move.nextTurn,
							winner: move.winner,
						}),
					);
					// Change turn to the player whose turn it is NOW (after this move)
					dispatch(
						allActions.boardActions.changeTurn(
							nextIsMyTurn ? myUsername : opponentUsername,
						),
					);
				},
			});
		};

		const handleGameEnd = (raw: unknown) => {
			const parsed = parseGameEnd(raw);
			if (!parsed.success || !parsed.data) {
				console.error(parsed.error);
				return;
			}
			const data = parsed.data as GameEndData;
			console.log("Game ended", data);
			setGameStatus("finished");

			dispatch(
				allActions.multiplayerActions.updateGameState({
					status: "finished",
					winner: data.winner,
				}),
			);

			const gameState = gameStateRef.current;
			const myUserId = myUserIdRef.current;
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

		const handleGameError = (data: unknown) => {
			const parsed = parseGameErrorMessage(data);
			if (!parsed.success || parsed.data === undefined) {
				console.error(parsed.error);
				return;
			}
			const err = parsed.data;
			console.error("Game error", err);
			setError(err);
			dispatch(allActions.multiplayerActions.setError(err));
			dispatch(allActions.messageActions.setMessage(err, "message"));
		};

		socket.on("game:state", handleGameState);
		socket.on("game:move", handleGameMove);
		socket.on("game:end", handleGameEnd);
		socket.on("game:error", handleGameError);

		// Auto-join game when connected
		const handleJoinGame = () => {
			if (gameIdRef.current && isConnected) {
				console.log("Emitting game:join", {
					gameId: gameIdRef.current,
					myUserId: myUserIdRef.current,
				});
				emitValidated(socket, "game:join", GameIdSchema, gameIdRef.current);
			}
		};

		// Join game if connected and we have user ID
		if (isConnected && myUserIdRef.current) {
			handleJoinGame();
		}

		return () => {
			socket.off("game:state", handleGameState);
			socket.off("game:move", handleGameMove);
			socket.off("game:end", handleGameEnd);
			socket.off("game:error", handleGameError);
		};
	}, [socket, isConnected, initializeBaseFromServer, applyMove, dispatch]);

	// Listen for session restore on connect
	useEffect(() => {
		if (!socket) return;

		const handleConnect = () => {
			const session = storageService.getItem("session");
			if (session) {
				try {
					const parsed = JSON.parse(session);
					if (parsed.sessionID && parsed.userID) {
						handleSessionRestore(parsed);
					}
				} catch {
					// Invalid session data, ignore
				}
			}
		};

		// Check if already connected
		if (socket.connected) {
			handleConnect();
		}

		socket.on("connect", handleConnect);

		return () => {
			socket.off("connect", handleConnect);
		};
	}, [socket, handleSessionRestore]);

	// Re-join game when myUserId becomes available
	useEffect(() => {
		if (myUserId && isConnected && socket && gameId) {
			console.log("Re-joining game with myUserId:", myUserId);
			emitValidated(socket, "game:join", GameIdSchema, gameId);
		}
	}, [myUserId, isConnected, socket, gameId]);

	const joinGame = useCallback(() => {
		if (gameId && isConnected && socket) {
			console.log("Emitting game:join", {
				gameId,
				myUserId: myUserIdRef.current,
			});
			emitValidated(socket, "game:join", GameIdSchema, gameId);
		}
	}, [gameId, isConnected, socket]);

	const makeMove = useCallback(
		(
			moveGameId: string,
			selection: letterObject[],
			word: string,
			preMoveBase?: letterObject[],
		) => {
			if (socket) {
				console.log("Emitting game:move", {
					gameId: moveGameId,
					selection,
					word,
				});
				// Store pre-move base for history entry when server echoes back
				if (preMoveBase) {
					ourMovePreBaseRef.current = preMoveBase;
				}
				emitValidated(socket, "game:move", ClientGameMoveSchema, {
					gameId: moveGameId,
					selection,
					word,
				});
			}
		},
		[socket],
	);

	return {
		opponentId,
		opponentName,
		gameStatus,
		isMyTurn,
		error,
		myUserId,
		myUsername,
		computerSelect,
		joinGame,
		makeMove,
	};
};
