import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
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
import wordService from "../services/words";
import type { letterObject, selectionObject, playedWord } from "../types/types";
import { storageService } from "../services/storageService";

interface GameStartData {
	gameId: string;
	players: [string, string];
	player1: string;
	player2: string;
	board: string[][];
}

interface GameState {
	gameId: string;
	board: string[][];
	base: letterObject[];
	turn: string;
	playedWords: playedWord[];
	players: [string, string];
	playerNames: Record<string, string>;
	status: "waiting" | "playing" | "finished";
	winner?: string;
}

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
	"game:move": (move: { gameId: string; selection: letterObject[]; word: string }) => void;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
	"http://localhost:3000",
	{ autoConnect: false },
);

export const MultiplayerGameBoardPage: React.FC = () => {
	const { gameId } = useParams<{ gameId: string }>();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	
	const { board, turn, newGame, isLoading } = useSelector(selectBoard);
	const {
		base,
		selection: selected,
		playedWords,
		playerName,
		possibleWordPositions,
		stateHistory,
	} = useSelector(selectBase);
	const { type: messageType } = useSelector(selectMessage);
	
	const webWorker = useRef<Worker | null>(null);
	const [myUserId, setMyUserId] = useState<string>("");
	const [myUsername, setMyUsername] = useState<string>("");
	const [opponentId, setOpponentId] = useState<string>("");
	const [opponentName, setOpponentName] = useState<string>("");
	const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "finished">("waiting");
	const [error, setError] = useState<string | null>(null);
	const [isMyTurn, setIsMyTurn] = useState(false);
	const gameStateRef = useRef<GameState | null>(null);

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
			setOpponentId(state.players.find(p => p !== myUserId) || "");
			setOpponentName(state.playerNames[state.players.find(p => p !== myUserId) || ""] || "Opponent");
			setGameStatus(state.status);
			
			const isMyTurnNow = state.turn === myUserId;
			setIsMyTurn(isMyTurnNow);
			
			// Set player name in Redux store
			dispatch(allActions.baseActions.changePlayerName(myUsername));
			
			if (state.status === "finished" && state.winner) {
				const winnerName = state.winner === myUserId ? "You" : opponentName;
				dispatch(allActions.messageActions.setMessage(
					`Game over! ${winnerName} won!`, 
					"message"
				));
			}

			// Initialize board and base from server state
			dispatch(allActions.boardActions.newGame(false, state.turn === myUserId ? myUsername : opponentName, false));
			dispatch(allActions.boardActions.gameStart());
			
			// Initialize stateHistory with initial game state
			const initialHistory = {
				base: state.base,
				selection: [],
				turn: state.turn === myUserId ? myUsername : opponentName,
			};
			dispatch(allActions.baseActions.createHistory(initialHistory.base, [], initialHistory.turn));
			
			// Convert base to include possibleWords from worker
			// For now, just use the base as-is and let worker calculate possibleWords
			initializeBaseFromServer(state.base, state.board);
		});

		socket.on("game:move", (move: GameMove) => {
			console.log("Received game move", move);
			gameStateRef.current = { ...gameStateRef.current!, ...move, base: move.newBase, playedWords: move.playedWords, turn: move.nextTurn };
			
			const isMyMove = move.playerId === myUserId;
			const nextIsMyTurn = move.nextTurn === myUserId;
			setIsMyTurn(nextIsMyTurn);
			
			if (move.winner) {
				setGameStatus("finished");
				const winnerName = move.winner === myUserId ? "You" : opponentName;
				dispatch(allActions.messageActions.setMessage(
					`Game over! ${winnerName} won with "${move.word}"!`, 
					"message"
				));
				return;
			}
			
			// Update board state
			dispatch(allActions.baseActions.confirmSelection(
				move.newBase,
				move.playedWords,
				[] // clear selection
			));
			dispatch(allActions.boardActions.changeTurn(nextIsMyTurn ? playerName : opponentName));
		});

		socket.on("game:end", (data: GameEndData) => {
			console.log("Game ended", data);
			setGameStatus("finished");
			const winnerName = data.winner === myUserId ? "You" : opponentName;
			let message = `Game over! ${winnerName} won!`;
			if (data.reason === "disconnect") {
				message = `Game over! ${winnerName} won by forfeit (opponent disconnected).`;
			}
			dispatch(allActions.messageActions.setMessage(message, "message"));
		});

		socket.on("game:error", (err: string) => {
			console.error("Game error", err);
			setError(err);
			dispatch(allActions.messageActions.setMessage(err, "message"));
		});

		return () => {
			socket.off("game:state");
			socket.off("game:move");
			socket.off("game:end");
			socket.off("game:error");
		};
	}, [myUserId, opponentName, dispatch, playerName]);

	const initializeBaseFromServer = async (serverBase: letterObject[], serverBoard: string[][]) => {
		// We need to calculate possibleWords for each letter using the worker
		const words = await wordService.fetchAll();
		const objToSend = { board: serverBoard, playerName: myUserId, words };
		
		if (webWorker.current) {
			webWorker.current.terminate();
		}
		webWorker.current = new Worker(new URL("../worker/worker.js", import.meta.url), { type: "module" });
		
		webWorker.current.postMessage(objToSend);
		dispatch(allActions.boardActions.isLoading(true));
		
		webWorker.current.onmessage = (event) => {
			// Merge server base ownership with worker-calculated possibleWords
			const workerBase = event.data;
			const mergedBase = serverBase.map(serverLetter => {
				const workerLetter = workerBase.find((w: letterObject) => w.row === serverLetter.row && w.column === serverLetter.column);
				return workerLetter ? { ...workerLetter, owner: serverLetter.owner } : serverLetter;
			});
			dispatch(allActions.baseActions.createBase(mergedBase));
			dispatch(allActions.boardActions.isLoading(false));
		};
	};

	const gameChange = () => {
		// In multiplayer, game end is handled by server via game:end event
		// This is kept for single-player compatibility
		setTimeout(() => {
			startNewGame();
		}, 1500);
	};

	const startNewGame = () => {
		dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []));
		dispatch(allActions.boardActions.newGame(true, myUsername, true));
		if (messageType === "start") {
			dispatch(allActions.messageActions.clearMessage());
		}
		// TODO: Send new game request to server
	};

	const checkBoard = async () => {
		const positionsWithPossibleWords = base.filter((w) => w.possibleWords && w.possibleWords.length > 0);
		const possibleWordsPercentage = (100 * positionsWithPossibleWords.length) / base.length;
		if (!Number.isNaN(possibleWordsPercentage)) {
			if (possibleWordsPercentage < 74) {
				initializeBaseFromServer(base, board);
			} else {
				dispatch(allActions.boardActions.isLoading(false));
			}
		}
	};

	const showResetModal = () => {
		dispatch(allActions.messageActions.setMessage("are you sure you want to reset the game?", "reset"));
	};

	const showStartModal = () => {
		dispatch(allActions.messageActions.setMessage("are you sure you want to start new game?", "start"));
	};

	const resetGame = () => {
		// For multiplayer, reset to initial base from server
		if (gameStateRef.current) {
			const initialBase = gameStateRef.current.base;
			dispatch(allActions.baseActions.resetBase(initialBase));
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
		const playedAgain = playedWords.filter((word) => word.owner === myUserId).filter((word) => word.word === newWord);
		
		if (wordExist && !playedAgain.length) {
			const history = [...base];
			dispatch(allActions.baseActions.createHistory(history, selected, myUserId));
			
			const confirmedAndFiltered = gameService.updateOwnersAndRemoveIsolatedNodes(selected, base, board, myUserId);
			const checkGame = gameService.checkIfWinMultiplayer(selected, myUserId, board.length, gameStateRef.current?.players[0] || myUserId);
			
			// Send move to server
			socket.emit("game:move", {
				gameId: gameId!,
				selection: selected,
				word: newWord,
			});
			
			// Optimistic update - always change turn, server will confirm or end game
			dispatch(allActions.baseActions.confirmSelection(
				confirmedAndFiltered,
				[...playedWords, { word: newWord, owner: myUserId, turn: stateHistory.length }],
				[]
			));
			
			// Optimistically change turn; server will send game:move with correct state or game:end
			if (!checkGame) {
				dispatch(allActions.boardActions.changeTurn(opponentName));
			}
			// If checkGame is true, we optimistically show win but wait for server confirmation
		} else {
			const message = playedAgain.length > 0 
				? `cant play same word twice, ${newWord} already played`
				: `word ${newWord}, does not exist`;
			dispatch(allActions.messageActions.setMessage(message, "message"));
			removeSelection();
		}
	};

	const removeSelection = () => {
		dispatch(allActions.baseActions.removeFromSelection(0));
	};

	const selectLetter = async (letter: string, row: number, column: number, owner: string) => {
		if (!isMyTurn || gameStatus !== "playing") return;
		
		const obj = { letter: letter, row: row, column: column, owner: owner };
		const selectionOnBase = base.filter((s) => s.owner === obj.owner && s.column === obj.column && s.row === obj.row);
		
		if (selectionOnBase.length || selected.length) {
			const result: selectionObject = gameService.checkIfLetterSelectionIsallowed(obj, board, selected, myUserId);
			if (result.possibleSelection) {
				result.selectedBeforeIndex === -1
					? dispatch(allActions.baseActions.updateSelection([...selected, obj]))
					: dispatch(allActions.baseActions.removeFromSelection(result.selectedBeforeIndex));
			}
		}
	};

	const timeTravel = (turn: number) => {
		const currentBase = [...base];
		const timeOutCounter = stateHistory[turn].selection.length;
		dispatch(allActions.baseActions.updateBase(stateHistory[turn].base));
		// Visual replay
		setTimeout(() => {
			backToPresent(currentBase);
			removeSelection();
		}, timeOutCounter * 500 + 700);
	};

	const computerSelect = (selection: letterObject[]) => {
		for (const [i, _s] of selection.entries()) {
			const selectionArray = selection.filter((_s, j) => j <= i);
			setTimeout(() => {
				dispatch(allActions.baseActions.updateSelection(selectionArray));
			}, (i + 1) * 500);
		}
	};

	const backToPresent = (base: letterObject[]) => {
		dispatch(allActions.baseActions.updateBase(base));
	};

	useEffect(() => {
		if (newGame && gameStateRef.current) {
			initializeBaseFromServer(gameStateRef.current.base, gameStateRef.current.board);
		} else if (isLoading) {
			checkBoard();
		}
		// No automatic computer turn - wait for server move events
	}, [newGame, isLoading, possibleWordPositions]);

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
					{isLoading ? <LoadingTable /> : <Board selectLetter={selectLetter} />}
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
					<PlayedWordList timeTravel={timeTravel} opponentName={opponentName} isMultiplayer={true} />
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