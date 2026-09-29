import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import allActions from "../actions/allActions";
import { Board } from "../components/Board";
import { GameBoardButtons } from "../components/GameBoardButtons";
import { GameBoardHeader } from "../components/GameBoardHeader";
import { LoadingTable } from "../components/LoadingTable";
import { LogoContainer } from "../components/LogoContainer";
import { Message } from "../components/Message";
import { PlayedWordList } from "../components/PlayedWordList";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
import { selectMessage } from "../reducers/messageReducer";
import gameService from "../services/game";
import { storageService } from "../services/storageService";
import wordService from "../services/words";
import type {
	GameState,
	letterObject,
	playedWord,
	selectionObject,
} from "../types/types";

interface GameMove {
	gameId: string;
	playerId: string;
	selection: letterObject[];
	word: string;
	newBase: letterObject[];
	playedWords: playedWord[];
	nextTurn: string;
	winner?: string;
}

interface GameEndData {
	gameId: string;
	winner: string;
	reason: "win" | "forfeit" | "disconnect";
}

interface ServerToClientEvents {
	"game:state": (state: GameState) => void;
	"game:move": (move: GameMove) => void;
	"game:turn": (turn: string) => void;
	"game:end": (data: GameEndData) => void;
	"game:error": (error: string) => void;
}

interface ClientToServerEvents {
	"game:join": (gameId: string) => void;
	"game:move": (move: {
		gameId: string;
		selection: letterObject[];
		word: string;
	}) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	"http://localhost:3000",
	{ autoConnect: false },
);

export const MultiplayerGameBoardPage: React.FC = () => {
	const { gameId } = useParams<{ gameId: string }>();
	const dispatch = useDispatch();

	const { board, newGame, isLoading } = useSelector(selectBoard);
	const {
		base,
		selection: selected,
		playedWords,
		playerName,
		stateHistory,
	} = useSelector(selectBase);
	const { type: messageType } = useSelector(selectMessage);

	const [myUserId, setMyUserId] = useState<string>("");
	const [_myUsername, setMyUsername] = useState<string>("");
	const [opponentId, setOpponentId] = useState<string>("");
	const [opponentName, setOpponentName] = useState<string>("");
	const [gameStatus, setGameStatus] = useState<
		"waiting" | "playing" | "finished"
	>("waiting");
	const [error, _setError] = useState<string | null>(null);
	const [isMyTurn, setIsMyTurn] = useState(false);
	const gameStateRef = useRef<GameState | null>(null);

	const initializeBaseFromServer = useCallback(
		(serverBase: letterObject[]) => {
			// For multiplayer, we don't need the worker (which calculates possibleWords for AI).
			// Human players only need adjacency validation, which is done by checkIfLetterSelectionIsallowed.
			// Just use the server's base directly which has correct ownership.
			dispatch(allActions.baseActions.createBase(serverBase));
			dispatch(allActions.boardActions.isLoading(false));
		},
		[dispatch],
	);

	// Initialize socket connection
	useEffect(() => {
		if (!gameId) return;

		const session = storageService.getItem("session");
		if (session) {
			const parsed = JSON.parse(session);
			setMyUserId(parsed.userID);
			setMyUsername(parsed.username || "Player");
			socket.auth = { sessionID: parsed.sessionID };
		}

		socket.connect();
		socket.emit("game:join", gameId);

		return () => {
			socket.disconnect();
		};
	}, [gameId]);

	// Socket event handlers
	useEffect(() => {
		socket.on("game:state", (state: GameState) => {
			console.log("Received game state", state);
			gameStateRef.current = state;
			const opponentIdFound = state.players.find((p) => p !== myUserId) || "";
			setOpponentId(opponentIdFound);
			setOpponentName(state.playerNames[opponentIdFound] || "Opponent");
			setGameStatus(state.status);

			const isMyTurnNow = state.turn === myUserId;
			setIsMyTurn(isMyTurnNow);

			// Determine player labels: Player 1 is at row 0 (player1Id), Player 2 is at row 11
			const player1Id = state.player1Id || state.players[0];
			const isPlayer1 = myUserId === player1Id;
			const myPlayerLabel = isPlayer1 ? "Player 1" : "Player 2";
			const opponentPlayerLabel = isPlayer1 ? "Player 2" : "Player 1";

			// Set player name in Redux store for display
			dispatch(allActions.baseActions.changePlayerName(myPlayerLabel));

			if (state.status === "finished" && state.winner) {
				const winnerName =
					state.winner === myUserId ? "You" : opponentPlayerLabel;
				dispatch(
					allActions.messageActions.setMessage(
						`Game over! ${winnerName} won!`,
						"message",
					),
				);
			}

			// Initialize board and base from server state
			dispatch(allActions.boardActions.createBoard(state.board));
			dispatch(
				allActions.boardActions.newGame(
					false,
					isMyTurnNow ? myPlayerLabel : opponentPlayerLabel,
					false,
				),
			);
			dispatch(allActions.boardActions.gameStart());

			// Initialize stateHistory with initial game state
			const initialHistory = {
				base: state.base,
				selection: [],
				turn: isMyTurnNow ? myPlayerLabel : opponentPlayerLabel,
			} as const;
			dispatch(
				allActions.baseActions.createHistory(
					initialHistory.base,
					[],
					initialHistory.turn,
				),
			);

			// Initialize base from server state
			initializeBaseFromServer(state.base);
		});

		socket.on("game:move", (move: GameMove) => {
			console.log("Received game move", move);
			// Preserve player1Id from previous state
			const previousPlayer1Id: string =
				gameStateRef.current?.player1Id ||
				gameStateRef.current?.players[0] ||
				"";
			// Extract values before conditional to avoid TypeScript narrowing
			const currentBoard = gameStateRef.current?.board || [];
			const currentPlayers = gameStateRef.current?.players || ["", ""];
			const currentPlayerNames = gameStateRef.current?.playerNames || {};

			if (gameStateRef.current) {
				gameStateRef.current = {
					...gameStateRef.current,
					...move,
					base: move.newBase,
					playedWords: move.playedWords,
					turn: move.nextTurn,
					player1Id: previousPlayer1Id, // Preserve player1Id
				};
			} else {
				gameStateRef.current = {
					gameId: move.gameId,
					board: currentBoard,
					base: move.newBase,
					turn: move.nextTurn,
					playedWords: move.playedWords,
					players: currentPlayers,
					playerNames: currentPlayerNames,
					status: "playing" as const,
					player1Id: previousPlayer1Id,
				};
			}

			const nextIsMyTurn = move.nextTurn === myUserId;
			setIsMyTurn(nextIsMyTurn);

			// Determine player labels
			const player1Id =
				gameStateRef.current?.player1Id || gameStateRef.current?.players[0];
			const isPlayer1 = myUserId === player1Id;
			const myPlayerLabel = isPlayer1 ? "Player 1" : "Player 2";
			const opponentPlayerLabel = isPlayer1 ? "Player 2" : "Player 1";

			if (move.winner) {
				setGameStatus("finished");
				const winnerName =
					move.winner === myUserId ? "You" : opponentPlayerLabel;
				dispatch(
					allActions.messageActions.setMessage(
						`Game over! ${winnerName} won with "${move.word}"!`,
						"message",
					),
				);
				return;
			}

			// Update board state
			dispatch(
				allActions.baseActions.confirmSelection(
					move.newBase,
					move.playedWords,
					[], // clear selection
				),
			);
			dispatch(
				allActions.boardActions.changeTurn(
					nextIsMyTurn ? myPlayerLabel : opponentPlayerLabel,
				),
			);
		});

		socket.on("game:end", (data: GameEndData) => {
			console.log("Game ended", data);
			setGameStatus("finished");

			// Determine player labels
			const player1Id =
				gameStateRef.current?.player1Id || gameStateRef.current?.players[0];
			const isPlayer1 = myUserId === player1Id;
			const opponentPlayerLabel = isPlayer1 ? "Player 2" : "Player 1";

			const winnerName = data.winner === myUserId ? "You" : opponentPlayerLabel;
			let message = `Game over! ${winnerName} won!`;
			if (data.reason === "disconnect") {
				message = `Game over! ${winnerName} won by forfeit (opponent disconnected).`;
			}
			dispatch(allActions.messageActions.setMessage(message, "message"));
		});

		socket.on("game:error", (err: string) => {
			console.error("Game error", err);
			_setError(err);
			dispatch(allActions.messageActions.setMessage(err, "message"));
		});

		return () => {
			socket.off("game:state");
			socket.off("game:move");
			socket.off("game:end");
			socket.off("game:error");
		};
	}, [myUserId, dispatch, initializeBaseFromServer]);

	const startNewGame = () => {
		dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []));

		// Determine player labels
		const player1Id =
			gameStateRef.current?.player1Id || gameStateRef.current?.players[0];
		const isPlayer1 = myUserId === player1Id;
		const myPlayerLabel = isPlayer1 ? "Player 1" : "Player 2";

		// Use server's board for new game
		if (gameStateRef.current) {
			dispatch(allActions.boardActions.createBoard(gameStateRef.current.board));
		}
		dispatch(allActions.boardActions.newGame(true, myPlayerLabel, true));
		if (messageType === "start") {
			dispatch(allActions.messageActions.clearMessage());
		}
	};

	const showResetModal = () => {
		dispatch(
			allActions.messageActions.setMessage(
				"are you sure you want to reset the game?",
				"reset",
			),
		);
	};

	const showStartModal = () => {
		dispatch(
			allActions.messageActions.setMessage(
				"are you sure you want to start new game?",
				"start",
			),
		);
	};

	const resetGame = () => {
		// For multiplayer, reset to initial base from server
		if (gameStateRef.current) {
			const initialBase = gameStateRef.current.base;
			dispatch(allActions.baseActions.resetBase(initialBase));

			// Use server's board
			dispatch(allActions.boardActions.createBoard(gameStateRef.current.board));

			// Determine player labels
			const player1Id =
				gameStateRef.current.player1Id || gameStateRef.current.players[0];
			const isPlayer1 = myUserId === player1Id;
			const myPlayerLabel = isPlayer1 ? "Player 1" : "Player 2";
			const opponentPlayerLabel = isPlayer1 ? "Player 2" : "Player 1";

			// Reset turn to player 1 (who starts at row 0)
			const firstTurnLabel = isPlayer1 ? myPlayerLabel : opponentPlayerLabel;
			dispatch(allActions.baseActions.changePlayerName(myPlayerLabel));
			dispatch(allActions.boardActions.newGame(false, firstTurnLabel, false));
		} else {
			dispatch(allActions.baseActions.resetBase(stateHistory[1]?.base || []));
		}
		dispatch(allActions.messageActions.clearMessage());
	};

	const clearMessage = () => {
		dispatch(allActions.messageActions.clearMessage());
	};

	const confirmSelection = async () => {
		if (!isMyTurn || gameStatus !== "playing") return;

		const newWord = selected.map((s) => s.letter).join("");
		const wordExist = await wordService.fetchMatch(newWord);
		const playedAgain = playedWords
			.filter((word) => word.owner === myUserId)
			.filter((word) => word.word === newWord);

		if (wordExist && !playedAgain.length) {
			const history = [...base];

			// Determine player labels for history
			const player1Id =
				gameStateRef.current?.player1Id || gameStateRef.current?.players[0];
			const isPlayer1 = myUserId === player1Id;
			const myPlayerLabel = isPlayer1 ? "Player 1" : "Player 2";

			dispatch(
				allActions.baseActions.createHistory(history, selected, myPlayerLabel),
			);

			const confirmedAndFiltered =
				gameService.updateOwnersAndRemoveIsolatedNodes(
					selected,
					base,
					board,
					myUserId,
				);
			const checkGame = gameService.checkIfWinMultiplayer(
				selected,
				myUserId,
				board.length,
				gameStateRef.current?.players[0] || myUserId,
			);

			// Send move to server
			if (gameId) {
				socket.emit("game:move", {
					gameId,
					selection: selected,
					word: newWord,
				});
			}

			// Optimistic update - always change turn, server will confirm or end game
			dispatch(
				allActions.baseActions.confirmSelection(
					confirmedAndFiltered,
					[
						...playedWords,
						{ word: newWord, owner: myUserId, turn: stateHistory.length },
					],
					[],
				),
			);

			// Optimistically change turn; server will send game:move with correct state or game:end
			const opponentPlayerLabel = isPlayer1 ? "Player 2" : "Player 1";
			if (!checkGame) {
				dispatch(allActions.boardActions.changeTurn(opponentPlayerLabel));
			}
			// If checkGame is true, we optimistically show win but wait for server confirmation
		} else {
			const message =
				playedAgain.length > 0
					? `cant play same word twice, ${newWord} already played`
					: `word ${newWord}, does not exist`;
			dispatch(allActions.messageActions.setMessage(message, "message"));
			removeSelection();
		}
	};

	const removeSelection = () => {
		dispatch(allActions.baseActions.removeFromSelection(0));
	};

	const selectLetter = async (
		letter: string,
		row: number,
		column: number,
		_owner: string,
	) => {
		if (!isMyTurn || gameStatus !== "playing") return;

		// Get actual owner from base for validation
		const baseCell = base.find((b) => b.row === row && b.column === column);
		const actualOwner = baseCell?.owner || "none";

		// For validation, use actualOwner; for display in selection, use myUserId
		const validationObj = {
			letter: letter,
			row: row,
			column: column,
			owner: actualOwner,
		};
		const displayObj = {
			letter: letter,
			row: row,
			column: column,
			owner: myUserId,
		};

		const selectionOnBase = base.filter(
			(s) => s.owner === actualOwner && s.column === column && s.row === row,
		);

		if (selectionOnBase.length || selected.length) {
			const result: selectionObject =
				gameService.checkIfLetterSelectionIsallowed(
					validationObj,
					board,
					selected,
					myUserId,
				);
			if (result.possibleSelection) {
				result.selectedBeforeIndex === -1
					? dispatch(
							allActions.baseActions.updateSelection([...selected, displayObj]),
						)
					: dispatch(
							allActions.baseActions.removeFromSelection(
								result.selectedBeforeIndex,
							),
						);
			}
		}
	};

	const timeTravel = (turn: number) => {
		const currentBase = [...base];
		const timeOutCounter = stateHistory[turn].selection.length;
		dispatch(allActions.baseActions.updateBase(stateHistory[turn].base));
		// Visual replay
		setTimeout(
			() => {
				backToPresent(currentBase);
				removeSelection();
			},
			timeOutCounter * 500 + 700,
		);
	};

	const _computerSelect = (selection: letterObject[]) => {
		for (const [i, _s] of selection.entries()) {
			const selectionArray = selection.filter((_s, j) => j <= i);
			setTimeout(
				() => {
					dispatch(allActions.baseActions.updateSelection(selectionArray));
				},
				(i + 1) * 500,
			);
		}
	};

	const backToPresent = (base: letterObject[]) => {
		dispatch(allActions.baseActions.updateBase(base));
	};

	useEffect(() => {
		if (newGame && gameStateRef.current) {
			initializeBaseFromServer(gameStateRef.current.base);
		}
		// No automatic computer turn - wait for server move events
	}, [newGame, initializeBaseFromServer]);

	return (
		<div className="page-container">
			<div className="board-and-word-list">
				<div className="gameboard">
					<GameBoardHeader
						playerName={playerName}
						opponentName={opponentName}
						isMyTurn={isMyTurn}
						gameStatus={gameStatus}
					/>
					{isLoading ? (
						<LoadingTable />
					) : (
						<Board
							selectLetter={selectLetter}
							myUserId={myUserId}
							opponentId={opponentId}
						/>
					)}
					<GameBoardButtons
						newGame={showStartModal}
						resetGame={showResetModal}
						confirmSelection={confirmSelection}
						removeSelection={removeSelection}
						disabled={!isMyTurn || gameStatus !== "playing"}
					/>
					{error && <div className="error-message">{error}</div>}
				</div>
				<div className="wordlist-and-info-container">
					<PlayedWordList
						timeTravel={timeTravel}
						opponentName={opponentName}
						isMultiplayer={true}
						myUserId={myUserId}
						opponentId={opponentId}
					/>
					<LogoContainer />
				</div>
				<div>
					<Message
						resetGame={resetGame}
						clearMessage={clearMessage}
						startNewGame={startNewGame}
					/>
				</div>
			</div>
		</div>
	);
};
