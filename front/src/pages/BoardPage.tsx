import React, { useEffect, useRef } from 'react'
import gameService from '../services/game'
import { Board } from '../components/Board'
import { PlayedWordList } from '../components/PlayedWordList'
import { letterObject, selectionObject, playedWord, LetterStyle, PlayerWordStyle } from '../types/types'
import { useSelector, useDispatch } from 'react-redux'
import allActions from '../actions/allActions'
import { RootState } from '../reducers/combineReducer'

export const GameBoardPage: React.FC = () => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)
    const turn: string = useSelector((state: RootState) => state.board.turn)
    const newGame: boolean = useSelector((state: RootState) => state.board.newGame)
    const confirmedSelections: letterObject[] = useSelector((state: RootState) => state.base.base)
    const selected: letterObject[] = useSelector((state: RootState) => state.base.selection)
    const playedWords: playedWord[] = useSelector((state: RootState) => state.base.playedWords)
    const playerName: string = useSelector((state: RootState) => state.base.playerName)

    const gameChange = () => {
        setTimeout(() => {
            alert(`winner is ${turn}`)
            startNewGame()
        }, 2000);
    }

    const startNewGame = () => {
        const nextTurn = turn === 'computer' ? playerName : 'computer'   
        dispatch(allActions.baseActions.updatePlayedWords([]))
        dispatch(allActions.boardActions.newGame(true, nextTurn))
    }

    const confirmSelection = async () => {
        const newWord = selected.map(s => s.letter).join('')
        const wordExist = await gameService.fetchMatch(newWord)
        const playedAgain = playedWords.filter(word => word.word === newWord)
        if(wordExist && playedAgain.length === 0){
            const newSelectionConfirmed = selected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: []}))
            const confirmedAndFiltered = gameService.removeDuplicates(newSelectionConfirmed, confirmedSelections, board, turn)
            const checkGame = gameService.checkIfWin(newSelectionConfirmed, turn, board.length)
            dispatch(allActions.baseActions.confirmSelection(confirmedAndFiltered.concat(newSelectionConfirmed), [...playedWords, {word: newWord, owner: turn}], []))
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

    const computersTurn = async () => {
        const updateSelections = await gameService.updateValues(confirmedSelections, board, playedWords.filter(f => f.owner === turn), turn)
        const computerSelected = gameService.getBestWord(updateSelections, turn, board.length)
        const newSelectionConfirmed = computerSelected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: s.possibleWords}))
        const confirmedAndFiltered = gameService.removeDuplicates(newSelectionConfirmed, updateSelections, board, turn)
        const checkGame = gameService.checkIfWin(newSelectionConfirmed, turn, board.length)
        dispatch(allActions.baseActions.confirmSelection(confirmedAndFiltered.concat(newSelectionConfirmed), [...playedWords, {word: computerSelected.map(s => s.letter).join(''), owner: turn}], []))
        checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn(playerName))
    }

    const selectLetter = async (letter: string, row: number, column: number, owner: string) => {
        let obj = { letter: letter, row: row, column: column, owner: owner}
        const result: selectionObject = gameService.checkIfLetterSelectionIsallowed(obj, board, selected, turn)
        if (result.possibleSelection){
            result.selectedBeforeIndex === -1 ?
            dispatch(allActions.baseActions.updateSelection([...selected, obj])) :
            dispatch(allActions.baseActions.removeFromSelection(result.selectedBeforeIndex))
            }
        }  
    
    const getLetterStyle = (r: number, c:number): LetterStyle => {
        const found = selected.filter(a => a.row === r && a.column === c)
        const isSelected = found.length === 0 ? 'none' : 'selectedLetter'
        const cursorStyle = turn  === 'computer' ? 'progress' : 'pointer'
        const selectedWithOwner: letterObject[] = selected.map(s => ({'row':s.row, 'column': s.column, 'letter': s.letter, 'owner': turn}))
        const allSelected = selectedWithOwner.concat(confirmedSelections)
        const ownerArr = allSelected.filter(a => a.row === r && a.column === c)
        const owner = ownerArr.length === 0 ? 'none' : ownerArr[0].owner
        const backgroundColor = owner === 'computer' ? 'lightsalmon' : owner === playerName ? 'paleturquoise' : null
        return { class: isSelected, backgroundColor: backgroundColor, cursor: cursorStyle}
    }

    const getWordStyle = (owner: string): PlayerWordStyle => {
        return owner === 'computer' ? {color: 'lightsalmon', textAlign: 'right'} : {color: 'paleturquoise', textAlign: 'left'} 
    }

    const getButtonStyle = (): string => {
        return selected.length > 0 ? 'gameboard-button' : 'gameboard-button-hidden'
    }
    
    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }

      useEffect(() => {
        scrollToBottom()
          if (newGame){
            dispatch(allActions.baseActions.createBase(board))
            dispatch(allActions.boardActions.gameStart())
          }  
          if (turn === 'computer' && !newGame){
              computersTurn()
          }
      }, [turn, newGame])

      const dispatch = useDispatch()

      const messagesEndRef = useRef(null)

        return  <div className='GameBoardContainer'>
                    <div className='BoardAndWordList'>
                        <div>
                            <Board selectLetter={selectLetter} confirmSelection={confirmSelection} getLetterStyle={getLetterStyle} removeSelection={removeSelection} getButtonStyle={getButtonStyle}/> 
                        </div> 
                        <div>
                            <PlayedWordList messagesEndRef={messagesEndRef} getWordStyle={getWordStyle}/>
                        </div>
                    </div>
                </div>;
    }