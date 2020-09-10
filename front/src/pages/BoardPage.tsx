import React, { useState, useEffect, useRef } from 'react'
import wordService from '../services/words'
import { Board } from '../components/Board'
import { PlayedWordList } from '../components/PlayedWordList'
import { letterObject, selectionObject, playedWord } from '../types/types'
import { useSelector, useDispatch } from 'react-redux'
import allActions from '../actions/allActions'
import { RootState } from '../reducers/combineReducer'

export const GameBoardPage: React.FC = () => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)
    const turn: string = useSelector((state: RootState) => state.board.turn)
    const newGame: boolean = useSelector((state: RootState) => state.board.newGame)
    const confirmedSelections: letterObject[] = useSelector((state: RootState) => state.base.base)
    const selected: letterObject[] = useSelector((state: RootState) => state.base.selection)
    const playedWords: playedWord[] = useSelector((state: RootState) => state.played.playedWords)

    const gameChange = () => {
        setTimeout(() => {
            alert(`winner is ${turn}`)
            startNewGame()
        }, 2000);
    }

    const startNewGame = () => {   
        dispatch(allActions.playedWordActions.updatePlayed([]))
        dispatch(allActions.boardActions.newGame(true))
    }

    const confirmSelection = () => {
        const newSelectionConfirmed = selected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: []}))
        const confirmedAndFiltered = wordService.removeDuplicates(newSelectionConfirmed, confirmedSelections, board, turn)
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        const checkGame = wordService.checkIfWin(newSelectionConfirmed, turn, board.length)
        dispatch(allActions.playedWordActions.updatePlayed([...playedWords, {word: selected.map(s => s.letter).join(''), owner: turn}])) 
        dispatch(allActions.baseActions.updateBase(newBase))
        dispatch(allActions.baseActions.updateSelection([]))
        checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn('player2'))        
    }

    const computersTurn = async () => {
        const updateSelections = await wordService.updateValues(confirmedSelections, board, playedWords.filter(f => f.owner === turn), turn)
        const computerSelected = wordService.getBestWord(updateSelections, turn, board.length)
        const newSelectionConfirmed = computerSelected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: s.possibleWords}))
        const confirmedAndFiltered = wordService.removeDuplicates(newSelectionConfirmed, updateSelections, board, turn)
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        const checkGame = wordService.checkIfWin(newSelectionConfirmed, turn, board.length)
        dispatch(allActions.playedWordActions.updatePlayed([...playedWords, {word: computerSelected.map(s => s.letter).join(''), owner: turn}]))
        dispatch(allActions.baseActions.updateBase(newBase))
        checkGame ? gameChange() : dispatch(allActions.boardActions.changeTurn('player1'))
    }

    const selectLetter = async (letter: string, row: number, column: number, owner: string) => {
        let obj = { letter: letter, row: row, column: column, owner: owner}
        const result: selectionObject = wordService.checkIfLetterSelectionIsallowed(obj, board, selected, turn)
        if (result.possibleSelection){
            result.selectedBeforeIndex === -1 ?
            dispatch(allActions.baseActions.updateSelection([...selected, obj])) :
            dispatch(allActions.baseActions.removeFromSelection(result.selectedBeforeIndex))
            }
        }  

    const getSelected = (r: number, c: number, type: string) => {
        if (type === 'class'){
            const found = selected.filter(a => a.row === r && a.column === c)
            return found.length === 0 ? 'none' : 'selectedLetter'
        } else {
            const selectedWithOwner: letterObject[] = selected.map(s => ({'row':s.row, 'column': s.column, 'letter': s.letter, 'owner': turn}))
            const allSelected = selectedWithOwner.concat(confirmedSelections)
            const found = allSelected.filter(a => a.row === r && a.column === c)
            return found.length === 0 ? 'none' : found[0].owner
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }

      useEffect(() => {
        scrollToBottom()
          if (newGame){
            dispatch(allActions.baseActions.createBase(board))
            dispatch(allActions.boardActions.newGame(false))
          }  
          if (turn === 'player2'){
              computersTurn()
          }
      }, [turn, newGame])

      const dispatch = useDispatch()

      const messagesEndRef = useRef(null)

        return  <div className='GameBoard'>
                    <div>
                        <h1>GameBoardPage</h1>
                    </div>
                    <div className='BoardAndWordList'>
                        <div>
                            <Board selectLetter={selectLetter} confirmSelection={confirmSelection} getSelected={getSelected} /> 
                        </div> 
                        <div>
                            <PlayedWordList messagesEndRef={messagesEndRef }/>
                        </div>
                    </div>
                </div>;
    }