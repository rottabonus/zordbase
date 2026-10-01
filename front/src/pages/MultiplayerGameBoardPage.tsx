import type React from "react";
import { useCallback, useEffect, useState } from "react";
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
import { selectMultiplayer } from "../reducers/multiplayerReducer";
import gameService from "../services/game";
import { storageService } from "../services/storageService";
import wordService from "../services/words";
import type {
	GameClientToServerEvents,
	GameEndData,
	GameMove,
	GameServerToClientEvents,
	GameState,
	letterObject,
	selectionObject,
} from "../types/types";

const socket: Socket<GameServerToClientEvents, GameClientToServerEvents> = io(
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
	const { gameState, error: multiplayerError } = useSelector(selectMultiplayer);

	const [myUserId, setMyUserId] = useState<string>("");
	const [_myUsername, setMyUsername] = useState<string>("");
	const [opponentId, setOpponentId] = useState<string>("");
	const [opponentName, setOpponentName] = useState<string>("");
	const [gameStatus, setGameStatus] = useState<
		"waiting" | "playing" | "finished"
	>("waiting");
	const [error, _setError] = useState<string | null>(null);
	const [isMyTurn, setIsMyTurn] = useState(false);

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
		});

		socket.on("game:move", (move: GameMove) => {
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
		});

		socket.on("game:end", (data: GameEndData) => {
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
		});

		socket.on("game:error", (err: string) => {
			console.error("Game error", err);
			_setError(err);
			dispatch(allActions.multiplayerActions.setError(err));
			dispatch(allActions.messageActions.setMessage(err, "message"));
		});

		return () => {
			socket.off("game:state");
			socket.off("game:move");
			socket.off("game:end");
			socket.off("game:error");
		};
	}, [myUserId, dispatch, initializeBaseFromServer, gameState]);

	const startNewGame = () => {
		dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []));

		const player1Id = gameState?.player1Id || gameState?.players[0];
		const isPlayer1 = myUserId === player1Id;
		const myPlayerLabel = isPlayer1 ? "Player 1" : "Player 2";

		if (gameState) {
			dispatch(allActions.boardActions.createBoard(gameState.board));
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
		if (gameState) {
			const initialBase = gameState.base;
			dispatch(allActions.baseActions.resetBase(initialBase));

			dispatch(allActions.boardActions.createBoard(gameState.board));

			const myUsername = gameState.playerNames[myUserId] || "You";
			const opponentIdFound =
				gameState.players.find((p) => p !== myUserId) || "";
			const opponentUsername =
				gameState.playerNames[opponentIdFound] || "Opponent";

			const player1Id = gameState.player1Id || gameState.players[0];
			const isPlayer1 = myUserId === player1Id;
			const firstTurnUsername = isPlayer1 ? myUsername : opponentUsername;
			dispatch(allActions.baseActions.changePlayerName(myUsername));
			dispatch(
				allActions.boardActions.newGame(false, firstTurnUsername, false),
			);
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

			const currentPlayerNames = gameState?.playerNames || {};
			const myUsername = currentPlayerNames[myUserId] || "You";
			const opponentIdFound =
				gameState?.players.find((p) => p !== myUserId) || "";
			const opponentUsername =
				currentPlayerNames[opponentIdFound] || "Opponent";

			dispatch(
				allActions.baseActions.createHistory(history, selected, myUsername),
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
				gameState?.players[0] || myUserId,
			);

			if (gameId) {
				socket.emit("game:move", {
					gameId,
					selection: selected,
					word: newWord,
				});
			}

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

			if (!checkGame) {
				dispatch(allActions.boardActions.changeTurn(opponentUsername));
			}
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

		const baseCell = base.find((b) => b.row === row && b.column === column);
		const actualOwner = baseCell?.owner || "none";

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

	const backToPresent = (base: letterObject[]) => {
		dispatch(allActions.baseActions.updateBase(base));
	};

	useEffect(() => {
		if (newGame && gameState) {
			initializeBaseFromServer(gameState.base);
		}
	}, [newGame, initializeBaseFromServer, gameState]);

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
					{(error || multiplayerError) && (
						<div className="error-message">{error || multiplayerError}</div>
					)}
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
