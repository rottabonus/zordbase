import React, { useEffect, useRef } from 'react'
import gameService from '../services/game'
import { Board } from '../components/Board'
import { GameBoardButtons } from '../components/GameBoardButtons'
import { GameBoardHeader } from '../components/GameBoardHeader'
import { PlayedWordList } from '../components/PlayedWordList'
import { LoadingTable } from '../components/LoadingTable'
import { letterObject, selectionObject, playedWord, LetterStyle, PlayerWordStyle, ButtonVisibility } from '../types/types'
import { useSelector, useDispatch } from 'react-redux'
import allActions from '../actions/allActions'
import { RootState } from '../reducers/combineReducer'

export const GameBoardPage: React.FC = () => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)
    const turn: string = useSelector((state: RootState) => state.board.turn)
    const newGame: boolean = useSelector((state: RootState) => state.board.newGame)
    const base: letterObject[] = useSelector((state: RootState) => state.base.base)
    const selected: letterObject[] = useSelector((state: RootState) => state.base.selection)
    const playedWords: playedWord[] = useSelector((state: RootState) => state.base.playedWords)
    const playerName: string = useSelector((state: RootState) => state.base.playerName)
    const isLoading: boolean = useSelector((state: RootState) => state.board.isLoading)
    const possibleWordPositions: {[key:string]: string[]} = useSelector((state: RootState) => state.base.possibleWordPositions)
    const stateHistory = useSelector((state: RootState) => state.base.stateHistory)
    
    const gameChange = () => {
        setTimeout(() => {
            alert(`winner is ${turn}`)
            startNewGame()
        }, 2000);
    }

    const startNewGame = () => {
        //const nextTurn = turn === 'computer' ? playerName : 'computer'   
        dispatch(allActions.baseActions.removeSelectionAndPlayedWords([], []))
        dispatch(allActions.boardActions.newGame(true, playerName, true))
    }

    const checkBoard = async () => {
        const wholeBoard = await gameService.calculateValues(board, playerName)
        const positionsWithPossibleWords = wholeBoard.filter(w => w.possibleWords.length > 0)
        const possibleWordsPercentage =  100 * positionsWithPossibleWords.length / wholeBoard.length
        console.log('possibleWordsPercentage', possibleWordsPercentage)
        if(possibleWordsPercentage < 74){
            startNewGame()
        } else {
            dispatch(allActions.boardActions.hasLoaded())
            dispatch(allActions.baseActions.createBase(wholeBoard))
        }
    }

    const resetGame = () => {
        dispatch(allActions.baseActions.resetBase(stateHistory[1].base))
    }

    const confirmSelection = async () => {
        const newWord = selected.map(s => s.letter).join('')
        const wordExist = await gameService.fetchMatch(newWord)
        const playedAgain = playedWords.filter(word => word.owner === turn).filter(word => word.word === newWord)
        if(wordExist && playedAgain.length === 0){
            const history = [...base]
            dispatch(allActions.baseActions.createHistory(history, selected, turn))
            const newSelectionConfirmed = selected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn}))
            const confirmedAndFiltered = gameService.updateOwnersAndRemoveIsolatedNodes(newSelectionConfirmed, base, board, turn)
            const checkGame = gameService.checkIfWin(newSelectionConfirmed, turn, board.length)
            dispatch(allActions.baseActions.confirmSelection(confirmedAndFiltered, [...playedWords, {word: newWord, owner: turn, turn: stateHistory.length}], []))
            checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn('computer'))       
        } else {
            const message = playedAgain.length > 0 ? `cant play same word twice, ${newWord} already played` :  `word ${newWord}, does not exist`
            alert(message)
            removeSelection()
        }   
    }

    const removeSelection = () => {
        dispatch(allActions.baseActions.removeFromSelection(0))
    }

    const computersTurn =  () => {
        const history = [...base]
        const computerSelected = gameService.getBestWord(base, turn, board.length)
        const newSelectionConfirmed = computerSelected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: s.possibleWords}))
        dispatch(allActions.baseActions.createHistory(history, newSelectionConfirmed, turn))
        computerSelect(newSelectionConfirmed)
        const timeOutCounter = newSelectionConfirmed.length
        setTimeout(() => {
            const confirmedAndFiltered = gameService.updateOwnersAndRemoveIsolatedNodes(newSelectionConfirmed, base, board, turn)
            const fullyUpdatedBase = gameService.updateBaseWithPossibleWordTable(newSelectionConfirmed, possibleWordPositions, confirmedAndFiltered)
            const checkGame = gameService.checkIfWin(newSelectionConfirmed, turn, board.length)
            dispatch(allActions.baseActions.confirmSelection(fullyUpdatedBase, [...playedWords, {word: computerSelected.map(s => s.letter).join(''), owner: turn, turn: stateHistory.length}], []))
            checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn(playerName))
        }, timeOutCounter * 500 + 700  );
        
    }

    const selectLetter = async (letter: string, row: number, column: number, owner: string) => {
        let obj = { letter: letter, row: row, column: column, owner: owner}
        const selectionOnBase = base.filter(s => s.owner === obj.owner && s.column === obj.column && s.row === obj.row)
        if (selectionOnBase.length || selected.length > 0){
            const result: selectionObject = gameService.checkIfLetterSelectionIsallowed(obj, board, selected, turn)
            if (result.possibleSelection){
                result.selectedBeforeIndex === -1 ?
                dispatch(allActions.baseActions.updateSelection([...selected, obj])) :
                dispatch(allActions.baseActions.removeFromSelection(result.selectedBeforeIndex))
                }
            }
        }
    
    const timeTravel = (turn: number) => {
        const currentBase = [...base]
        const timeOutCounter = stateHistory[turn].selection.length
        dispatch(allActions.baseActions.updateBase(stateHistory[turn].base))
        computerSelect(stateHistory[turn].selection)
        setTimeout(() => {
            backToPresent(currentBase)
            removeSelection()
        }, timeOutCounter * 500 + 700 );
    }

    const computerSelect = (selection: letterObject[]) => {
        for(const [i, s] of selection.entries()){
            const selectionArray: letterObject[] = selection.filter((s: letterObject, j: number) => j <= i)
            setTimeout(() => {
                dispatch(allActions.baseActions.updateSelection(selectionArray))
            }, (i+1)*500);
        }
    }

    const backToPresent = (base: letterObject[]) => {
        dispatch(allActions.baseActions.updateBase(base))
    }
    
    const getLetterStyle = (r: number, c:number): LetterStyle => {
        const found = selected.filter(a => a.row === r && a.column === c)
        const isSelected = found.length === 0 ? 'none' : 'selectedLetter'
        const cursorStyle = turn  === 'computer' ? 'progress' : 'pointer'
        const selectedWithOwner: letterObject[] = selected.map(s => ({'row':s.row, 'column': s.column, 'letter': s.letter, 'owner': s.owner}))
        const allSelected = selectedWithOwner.concat(base)
        const ownerArr = allSelected.filter(a => a.row === r && a.column === c)
        const owner = ownerArr.length === 0 ? 'none' : ownerArr[0].owner
        const backgroundColor = owner === 'computer' ? 'lightsalmon' : owner === playerName ? 'paleturquoise' : null
        return { class: isSelected, backgroundColor: backgroundColor, cursor: cursorStyle}
    }

    const getWordStyle = (owner: string): PlayerWordStyle => {
        return owner === 'computer' ? {color: 'lightsalmon', textAlign: 'right'} : {color: 'paleturquoise', textAlign: 'left'} 
    }

    const getButtonStyle = (): ButtonVisibility => {
        return selected.length ? {visibility: 'visible', cursor: 'pointer' } : {visibility: 'hidden', cursor: 'auto' }
    }
    
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }


      useEffect(() => {
        scrollToBottom()
          if (newGame){
            dispatch(allActions.boardActions.gameStart())
            checkBoard()
          }  
          if (turn === 'computer' && !newGame){
              computersTurn()
          }
      }, [turn, newGame])


      const dispatch = useDispatch()

      const messagesEndRef = useRef(null)

        return  <div className='gameboard-page-container'>
                    <div className='board-and-word-list'>
                        <div className='gameboard'>
                            <GameBoardHeader />
                            { isLoading ? <LoadingTable />
                            :<Board selectLetter={selectLetter} getLetterStyle={getLetterStyle}/> }
                            <GameBoardButtons newGame={startNewGame} resetGame={resetGame} confirmSelection={confirmSelection} removeSelection={removeSelection} getButtonStyle={getButtonStyle}/>
                        </div> 
                        <div>
                            <PlayedWordList messagesEndRef={messagesEndRef} getWordStyle={getWordStyle} timeTravel={timeTravel}/>
                        </div>
                    </div>
                </div>;
    }