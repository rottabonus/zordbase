import type React from "react";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import allActions from "../actions/allActions";
import { Board } from "../components/Board";
import { GameBoardButtons } from "../components/GameBoardButtons";
import { GameBoardHeader } from "../components/GameBoardHeader";
import { LoadingTable } from "../components/LoadingTable";
import { LogoContainer } from "../components/LogoContainer";
import { Message } from "../components/Message";
import { PlayedWordList } from "../components/PlayedWordList";
import { useMultiplayerGame } from "../hooks/useMultiplayerGame";
import { selectBase } from "../reducers/baseReducer";
import { selectBoard } from "../reducers/boardReducer";
import { selectMessage } from "../reducers/messageReducer";
import { selectMultiplayer } from "../reducers/multiplayerReducer";
import gameService from "../services/game";
import wordService from "../services/words";
import type { letterObject, selectionObject } from "../types/types";

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

	const {
		opponentId,
		opponentName,
		gameStatus,
		isMyTurn,
		error,
		myUserId,
		computerSelect,
		joinGame,
		makeMove,
	} = useMultiplayerGame({
		gameId,
		initializeBaseFromServer,
	});

	// Join game when connected and we have user ID
	useEffect(() => {
		if (gameId && myUserId) {
			joinGame();
		}
	}, [gameId, myUserId, joinGame]);

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
			// Optimistic UI: show pending state, but don't compute locally
			// Server is authoritative - it will validate and compute the new state
			if (gameId) {
				makeMove(gameId, selected, newWord, base);
			}
			// Could add a pending indicator here if needed
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
		computerSelect(stateHistory[turn].selection);
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
