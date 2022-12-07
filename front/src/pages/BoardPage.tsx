import React, { useEffect } from "react";
import gameService from "../services/game";
import wordService from "../services/words";
import { Board } from "../components/Board";
import { GameBoardButtons } from "../components/GameBoardButtons";
import { GameBoardHeader } from "../components/GameBoardHeader";
import { PlayedWordList } from "../components/PlayedWordList";
import { LoadingTable } from "../components/LoadingTable";
import { LogoContainer } from "../components/LogoContainer";
import { Message } from "../components/Message";
import { letterObject, selectionObject } from "../types/types";
import { useSelector, useDispatch } from "react-redux";
import allActions from "../actions/allActions";
import { selectBoard } from "../reducers/boardReducer";
import { selectBase } from "../reducers/baseReducer";
import { selectMessage } from "../reducers/messageReducer";

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
  const webWorker = new Worker(
    new URL("../worker/worker.js", import.meta.url),
    { type: "module" }
  );
  const dispatch = useDispatch();

  const gameChange = () => {
    setTimeout(() => {
      dispatch(
        allActions.messageActions.setMessage(`winner is ${turn}`, "message")
      );
      startNewGame();
    }, 1500);
  };

  const startNewGame = () => {
    dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []));
    dispatch(allActions.boardActions.newGame(true, playerName, true));
    if (messageType === "start") {
      dispatch(allActions.messageActions.clearMessage());
    }
  };

  const checkBoard = async () => {
    const positionsWithPossibleWords = base.filter(
      (w) => w.possibleWords.length > 0
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
  };

  const initializeBase = async () => {
    const words: string[] = await wordService.fetchAll();
    const objToSend = { board, playerName, words };
    console.log("hello hello");
    webWorker.postMessage(objToSend);
    dispatch(allActions.boardActions.isLoading(true));
    webWorker.onmessage = (event) => {
      dispatch(allActions.baseActions.createBase(event.data));
    };
  };

  const showResetModal = () => {
    dispatch(
      allActions.messageActions.setMessage(
        "are you sure you want to reset the game?",
        "reset"
      )
    );
  };

  const showStartModal = () => {
    dispatch(
      allActions.messageActions.setMessage(
        "are you sure you want to start new game?",
        "start"
      )
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
          turn
        );
      const checkGame = gameService.checkIfWin(selected, turn, board.length);
      dispatch(
        allActions.baseActions.confirmSelection(
          confirmedAndFiltered,
          [
            ...playedWords,
            { word: newWord, owner: turn, turn: stateHistory.length },
          ],
          []
        )
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

  const removeSelection = () => {
    dispatch(allActions.baseActions.removeFromSelection(0));
  };

  const computersTurn = () => {
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
      allActions.baseActions.createHistory(history, newSelectionConfirmed, turn)
    );
    computerSelect(newSelectionConfirmed);
    const timeOutCounter = newSelectionConfirmed.length;
    setTimeout(() => {
      const confirmedAndFiltered =
        gameService.updateOwnersAndRemoveIsolatedNodes(
          newSelectionConfirmed,
          base,
          board,
          turn
        );
      const fullyUpdatedBase = gameService.updateBaseWithPossibleWordTable(
        newSelectionConfirmed,
        possibleWordPositions,
        confirmedAndFiltered
      );
      const checkGame = gameService.checkIfWin(
        newSelectionConfirmed,
        turn,
        board.length
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
          []
        )
      );
      checkGame
        ? gameChange()
        : dispatch(allActions.boardActions.changeTurn(playerName));
    }, timeOutCounter * 500 + 700);
  };

  const selectLetter = async (
    letter: string,
    row: number,
    column: number,
    owner: string
  ) => {
    let obj = { letter: letter, row: row, column: column, owner: owner };
    const selectionOnBase = base.filter(
      (s) =>
        s.owner === obj.owner && s.column === obj.column && s.row === obj.row
    );
    if (selectionOnBase.length || selected.length) {
      const result: selectionObject =
        gameService.checkIfLetterSelectionIsallowed(obj, board, selected, turn);
      if (result.possibleSelection) {
        result.selectedBeforeIndex === -1
          ? dispatch(allActions.baseActions.updateSelection([...selected, obj]))
          : dispatch(
              allActions.baseActions.removeFromSelection(
                result.selectedBeforeIndex
              )
            );
      }
    }
  };

  const timeTravel = (turn: number) => {
    const currentBase = [...base];
    const timeOutCounter = stateHistory[turn].selection.length;
    dispatch(allActions.baseActions.updateBase(stateHistory[turn].base));
    computerSelect(stateHistory[turn].selection);
    setTimeout(() => {
      backToPresent(currentBase);
      removeSelection();
    }, timeOutCounter * 500 + 700);
  };

  const computerSelect = (selection: letterObject[]) => {
    for (const [i, s] of selection.entries()) {
      const selectionArray: letterObject[] = selection.filter(
        (s: letterObject, j: number) => j <= i
      );
      setTimeout(() => {
        dispatch(allActions.baseActions.updateSelection(selectionArray));
      }, (i + 1) * 500);
    }
  };

  const backToPresent = (base: letterObject[]) => {
    dispatch(allActions.baseActions.updateBase(base));
  };

  useEffect(() => {
    if (newGame) {
      dispatch(allActions.boardActions.gameStart());
      initializeBase();
    } else if (isLoading) {
      checkBoard();
    } else if (turn === "computer" && !newGame) {
      computersTurn();
    }
  }, [turn, newGame, possibleWordPositions]);

  return (
    <div className="gameboard-page-container">
      <div className="board-and-word-list">
        <div className="gameboard">
          <GameBoardHeader />
          {isLoading ? <LoadingTable /> : <Board selectLetter={selectLetter} />}
          <GameBoardButtons
            newGame={showStartModal}
            resetGame={showResetModal}
            confirmSelection={confirmSelection}
            removeSelection={removeSelection}
          />
        </div>
        <div className="wordlist-and-info-container">
          <PlayedWordList timeTravel={timeTravel} />
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
