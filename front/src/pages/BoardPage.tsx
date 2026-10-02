import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import type { letterObject, selectionObject } from "../types/types";

export const GameBoardPage: React.FC = () => {
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
	const dispatch = useDispatch();

	// Create worker once, not on every render
	const webWorkerRef = useRef<Worker | null>(null);
	if (!webWorkerRef.current) {
		webWorkerRef.current = new Worker(
			new URL("../worker/worker.js", import.meta.url),
			{ type: "module" },
		);
	}
	const webWorker = webWorkerRef.current;

	const startNewGame = useCallback(() => {
		dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []));
		dispatch(allActions.boardActions.newGame(true, playerName, true));
		if (messageType === "start") {
			dispatch(allActions.messageActions.clearMessage());
		}
	}, [dispatch, messageType, playerName]);

	const gameChange = useCallback(() => {
		setTimeout(() => {
			dispatch(
				allActions.messageActions.setMessage(`winner is ${turn}`, "message"),
			);
			startNewGame();
		}, 1500);
	}, [dispatch, turn, startNewGame]);

	const initializeBase = useCallback(async () => {
		const words = await wordService.fetchAll();
		const objToSend = {
			board,
			player1Id: playerName,
			player2Id: "computer",
			isMultiplayer: false,
			words,
		};
		webWorker.postMessage(objToSend);
		dispatch(allActions.boardActions.isLoading(true));
		webWorker.onmessage = (event) => {
			dispatch(allActions.baseActions.createBase(event.data));
		};
	}, [board, dispatch, playerName, webWorker]);

	const checkBoard = useCallback(async () => {
		const positionsWithPossibleWords = base.filter(
			(w) => w.possibleWords && w.possibleWords.length > 0,
		);
		const possibleWordsPercentage =
			(100 * positionsWithPossibleWords.length) / base.length;
		if (!Number.isNaN(possibleWordsPercentage)) {
			if (possibleWordsPercentage < 74) {
				initializeBase();
			} else {
				dispatch(allActions.boardActions.isLoading(false));
			}
		}
	}, [base, dispatch, initializeBase]);

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

	const backToPresent = useCallback(
		(base: letterObject[]) => {
			dispatch(allActions.baseActions.updateBase(base));
		},
		[dispatch],
	);

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
		dispatch(allActions.baseActions.resetBase(stateHistory[1].base));
		dispatch(allActions.messageActions.clearMessage());
	};

	const clearMessage = () => {
		dispatch(allActions.messageActions.clearMessage());
	};

	const confirmSelection = async () => {
		const newWord = selected.map((s) => s.letter).join("");
		const wordExist = await wordService.fetchMatch(newWord);
		const playedAgain = playedWords
			.filter((word) => word.owner === turn)
			.filter((word) => word.word === newWord);
		if (wordExist && !playedAgain.length) {
			const history = [...base];
			dispatch(allActions.baseActions.createHistory(history, selected, turn));
			const confirmedAndFiltered =
				gameService.updateOwnersAndRemoveIsolatedNodes(
					selected,
					base,
					board,
					turn,
				);
			const checkGame = gameService.checkIfWin(selected, turn, board.length);
			dispatch(
				allActions.baseActions.confirmSelection(
					confirmedAndFiltered,
					[
						...playedWords,
						{ word: newWord, owner: turn, turn: stateHistory.length },
					],
					[],
				),
			);
			checkGame
				? gameChange()
				: dispatch(allActions.boardActions.changeTurn("computer"));
		} else {
			const message =
				playedAgain.length > 0
					? `cant play same word twice, ${newWord} already played`
					: `word ${newWord}, does not exist`;
			dispatch(allActions.messageActions.setMessage(message, "message"));
			removeSelection();
		}
	};

	const removeSelection = useCallback(() => {
		dispatch(allActions.baseActions.removeFromSelection(0));
	}, [dispatch]);

	const computersTurnRef = useRef<() => void>(() => {});

	const computersTurn = useCallback(() => {
		const history = [...base];
		const computerSelected = gameService.getBestWord(base, turn, board.length);
		const newSelectionConfirmed = computerSelected.map((s) => ({
			letter: s.letter,
			row: s.row,
			column: s.column,
			owner: turn,
			possibleWords: s.possibleWords,
		}));
		dispatch(
			allActions.baseActions.createHistory(
				history,
				newSelectionConfirmed,
				turn,
			),
		);
		computerSelect(newSelectionConfirmed);
		const timeOutCounter = newSelectionConfirmed.length;
		setTimeout(
			() => {
				const confirmedAndFiltered =
					gameService.updateOwnersAndRemoveIsolatedNodes(
						newSelectionConfirmed,
						base,
						board,
						turn,
					);
				const fullyUpdatedBase = gameService.updateBaseWithPossibleWordTable(
					newSelectionConfirmed,
					possibleWordPositions,
					confirmedAndFiltered,
				);
				const checkGame = gameService.checkIfWin(
					newSelectionConfirmed,
					turn,
					board.length,
				);
				dispatch(
					allActions.baseActions.confirmSelection(
						fullyUpdatedBase,
						[
							...playedWords,
							{
								word: computerSelected.map((s) => s.letter).join(""),
								owner: turn,
								turn: stateHistory.length,
							},
						],
						[],
					),
				);
				checkGame
					? gameChange()
					: dispatch(allActions.boardActions.changeTurn(playerName));
			},
			timeOutCounter * 500 + 700,
		);
	}, [
		base,
		turn,
		board,
		dispatch,
		playerName,
		stateHistory,
		playedWords,
		possibleWordPositions,
		gameChange,
		computerSelect,
	]);

	computersTurnRef.current = computersTurn;

	const selectLetter = async (
		letter: string,
		row: number,
		column: number,
		_owner: string,
	) => {
		const baseCell = base.find((b) => b.row === row && b.column === column);
		const actualOwner = baseCell?.owner || "none";

		// For validation, use actualOwner; for display in selection, use current player's turn
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
			owner: turn, // Use current player's turn for display
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
					turn,
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
		computerSelect(stateHistory[turn].selection);
		setTimeout(
			() => {
				backToPresent(currentBase);
				removeSelection();
			},
			timeOutCounter * 500 + 700,
		);
	};

	useEffect(() => {
		if (newGame) {
			dispatch(allActions.boardActions.gameStart());
			initializeBase();
		} else if (isLoading) {
			checkBoard();
		} else if (turn === "computer" && !newGame) {
			computersTurnRef.current();
		}
	}, [turn, newGame, checkBoard, dispatch, initializeBase, isLoading]);

	return (
		<div className="page-container">
			<div className="board-and-word-list">
				<div className="gameboard">
					<GameBoardHeader />
					{isLoading ? (
						<LoadingTable />
					) : (
						<Board
							selectLetter={selectLetter}
							myUserId={playerName}
							opponentId="computer"
						/>
					)}
					<GameBoardButtons
						newGame={showStartModal}
						resetGame={showResetModal}
						confirmSelection={confirmSelection}
						removeSelection={removeSelection}
					/>
				</div>
				<div className="wordlist-and-info-container">
					<PlayedWordList
						timeTravel={timeTravel}
						opponentName="computer"
						isMultiplayer={false}
						myUserId={playerName}
						opponentId="computer"
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
