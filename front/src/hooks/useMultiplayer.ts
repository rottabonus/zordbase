import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import allActions from "../actions/allActions";
import { useSocket } from "../contexts/SocketContext";
import { selectBase } from "../reducers/baseReducer";
import { selectMultiplayer } from "../reducers/multiplayerReducer";
import { storageService } from "../services/storageService";
import type {
	Challenge,
	GameEndData,
	GameMove,
	GameStartData,
	GameState,
	letterObject,
	Session,
	User,
} from "../types/types";

interface UseMultiplayerLobbyOptions {
	onSessionRestore?: (session: Session) => void;
	onConnectError?: (error: Error) => void;
	onGameStart?: (data: GameStartData) => void;
}

interface UseMultiplayerLobbyReturn {
	users: User[];
	session: Session | null;
	error: string | null;
	name: string;
	setName: (name: string) => void;
	incomingChallenge: Challenge | null;
	connect: (username: string) => void;
	disconnect: () => void;
	challenge: (userId: string) => void;
	acceptChallenge: (challengerId: string) => void;
	declineChallenge: () => void;
	isConnected: boolean;
}

export const useMultiplayerLobby = ({
	onSessionRestore,
	onGameStart,
}: UseMultiplayerLobbyOptions = {}): UseMultiplayerLobbyReturn => {
	const { socket, isConnected, connect, disconnect } = useSocket();

	const [users, setUsers] = useState<User[]>([]);
	const [session, setSession] = useState<Session | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [name, setName] = useState<string>(
		Math.random().toString(36).slice(2, 7),
	);
	const [incomingChallenge, setIncomingChallenge] = useState<Challenge | null>(
		null,
	);

	// Refs for callbacks to avoid stale closures
	const onGameStartRef = useRef(onGameStart);
	useEffect(() => {
		onGameStartRef.current = onGameStart;
	}, [onGameStart]);

	// Session restore handler
	const handleSessionRestore = useCallback(
		(restoredSession: Session) => {
			setSession(restoredSession);
			storageService.setItem("session", JSON.stringify(restoredSession));
			onSessionRestore?.(restoredSession);
		},
		[onSessionRestore],
	);

	// Connect with username
	const handleConnect = useCallback(
		(username: string) => {
			setError(null);
			connect({ username });
		},
		[connect],
	);

	// Event handlers for lobby
	useEffect(() => {
		if (!socket) return;

		const handleSessionSet = (newSession: Session) => {
			setSession(newSession);
			storageService.setItem("session", JSON.stringify(newSession));
			handleSessionRestore(newSession);
		};

		const handleUsersList = (usersList: User[]) => {
			console.log("initial users", usersList);
			setUsers(usersList.filter((user) => user.connected));
		};

		const handleUserConnected = (user: User) => {
			console.log("userconnected", user);
			setUsers((prevUsers) => [...prevUsers, user]);
		};

		const handleUserDisconnected = (id: string) => {
			console.log("disconnected", id);
			setUsers((prevUsers) =>
				prevUsers.filter((user) => user.userID !== id && user.connected),
			);
		};

		const handleChallengeGot = (challenge: Challenge) => {
			console.log("you got challenged", challenge);
			setIncomingChallenge(challenge);
		};

		const handleGameStart = (data: GameStartData) => {
			console.log("game starting", data);
			onGameStartRef.current?.(data);
		};

		socket.on("session:set", handleSessionSet);
		socket.on("users:list", handleUsersList);
		socket.on("user:connected", handleUserConnected);
		socket.on("user:disconnected", handleUserDisconnected);
		socket.on("challenge:got", handleChallengeGot);
		socket.on("game:start", handleGameStart);

		return () => {
			socket.off("session:set", handleSessionSet);
			socket.off("users:list", handleUsersList);
			socket.off("user:connected", handleUserConnected);
			socket.off("user:disconnected", handleUserDisconnected);
			socket.off("challenge:got", handleChallengeGot);
			socket.off("game:start", handleGameStart);
		};
	}, [socket, handleSessionRestore]);

	// Challenge actions
	const challenge = useCallback(
		(userId: string) => {
			console.log("challenge sent to ", userId);
			socket?.emit("challenge:new", userId, name);
		},
		[socket, name],
	);

	const acceptChallenge = useCallback(
		(challengerId: string) => {
			socket?.emit("challenge:accept", challengerId, name);
			setIncomingChallenge(null);
		},
		[socket, name],
	);

	const declineChallenge = useCallback(() => {
		setIncomingChallenge(null);
	}, []);

	return {
		users,
		session,
		error,
		name,
		setName,
		incomingChallenge,
		connect: handleConnect,
		disconnect,
		challenge,
		acceptChallenge,
		declineChallenge,
		isConnected,
	};
};

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
	makeMove: (gameId: string, selection: letterObject[], word: string) => void;
	setPreMoveBase: (base: letterObject[]) => void;
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
	// Pre-move base for our own move (set by page before makeMove)
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

		const handleGameState = (state: GameState) => {
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

		const handleGameMove = (move: GameMove) => {
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
				// Still update multiplayer state for winner
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

			// Create history entry for opponent's move
			const movePlayerName =
				move.playerId === myUserId ? myUsername : opponentUsername;
			// Use current board state (after all previous moves) as the base before this move
			// For our own moves, use the pre-move base captured before optimistic update
			const preMoveBase =
				move.playerId === myUserId
					? ourMovePreBaseRef.current ?? baseRef.current
					: baseRef.current;
			// Clear after use
			if (move.playerId === myUserId) {
				ourMovePreBaseRef.current = null;
			}
			dispatch(
				allActions.baseActions.createHistory(
					preMoveBase,
					move.selection,
					movePlayerName,
				),
			);

			// For remote player's move (now our turn): visualize FIRST, then update state
			if (nextIsMyTurn) {
				// Visualize opponent's move
				computerSelect(move.selection);
				const animationDuration = move.selection.length * 500 + 700;
				setTimeout(() => {
					// After animation: update base, playedWords, selection
					dispatch(
						allActions.baseActions.confirmSelection(
							move.newBase,
							move.playedWords,
							[],
						),
					);
					// Update multiplayer state (turn, etc.) AFTER visualization
					dispatch(
						allActions.multiplayerActions.updateGameState({
							base: move.newBase,
							playedWords: move.playedWords,
							turn: move.nextTurn,
							winner: move.winner,
						}),
					);
					dispatch(allActions.boardActions.changeTurn(myUsername));
				}, animationDuration);
			} else {
				// Our move echoed back (now opponent's turn): apply immediately
				dispatch(
					allActions.baseActions.confirmSelection(
						move.newBase,
						move.playedWords,
						[],
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
				dispatch(allActions.boardActions.changeTurn(opponentUsername));
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

		// Auto-join game when connected (will re-emit if already connected)
		const handleJoinGame = () => {
			if (gameIdRef.current && isConnected) {
				console.log("Emitting game:join", {
					gameId: gameIdRef.current,
					myUserId: myUserIdRef.current,
				});
				socket.emit("game:join", gameIdRef.current);
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
	}, [socket, isConnected, initializeBaseFromServer, computerSelect, dispatch]);

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
			socket.emit("game:join", gameId);
		}
	}, [myUserId, isConnected, socket, gameId]);

	const joinGame = useCallback(() => {
		if (gameId && isConnected && socket) {
			console.log("Emitting game:join", {
				gameId,
				myUserId: myUserIdRef.current,
			});
			socket.emit("game:join", gameId);
		}
	}, [gameId, isConnected, socket]);

	const makeMove = useCallback(
		(moveGameId: string, selection: letterObject[], word: string) => {
			if (socket) {
				console.log("Emitting game:move", {
					gameId: moveGameId,
					selection,
					word,
				});
				socket.emit("game:move", {
					gameId: moveGameId,
					selection,
					word,
				});
			}
		},
		[socket],
	);

	const setPreMoveBase = useCallback((base: letterObject[]) => {
		ourMovePreBaseRef.current = base;
	}, []);

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
		setPreMoveBase,
	};
};
