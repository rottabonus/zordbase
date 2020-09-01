import React, {useState, useEffect} from 'react';
import wordService from '../services/words'
import { Board } from '../components/Board'
import { PlayedWordList } from '../components/PlayedWordList'
import { letterObject, selectionObject, playedWord } from '../types/types'

export const GameBoardPage: React.FC = () => {

    const [board, setBoard] = useState<string[][]>([])
    const [selected, setSelected] = useState<letterObject[]>([])
    const [possibleWords, setpossibleWords] = useState<letterObject[][]>([])
    const [confirmedSelections, setConfirmedSelections] = useState<letterObject[]>([])
    const [turn, setTurn] = useState<string>('player1')
    const [playedWords, setPlayedWords] = useState<playedWord[]>([])

    const createBoard = () => {
        const board = wordService.createBoard(10, 8)
        setBoard(board)
        const playerOneBase = board[0].map( (letter, column) => ({'letter': letter, 'row': 0, 'column': column, 'owner': 'player1'}))
        const playerTwoBase = board[board.length-1].map( (letter, column) => ({'letter': letter, 'row': board.length-1, 'column': column, 'owner': 'player2'}))
        setConfirmedSelections(playerOneBase.concat(playerTwoBase))
    }

    const confirmSelection = () => {
        const newSelectionConfirmed = selected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn}))
        const confirmedAndFiltered = wordService.removeDuplicates(newSelectionConfirmed, confirmedSelections)
        const newWord = {word: selected.map(s => s.letter).join(""), owner: turn}
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        setSelected([])
        setPlayedWords([...playedWords, newWord]) 
        setConfirmedSelections(newBase)
        setTurn('player2')   
    }

    const computersTurn = async () => {
        const computerSelected = await wordService.computerTurn(confirmedSelections, board)
        const newSelectionConfirmed = computerSelected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn}))
        const confirmedAndFiltered = wordService.removeDuplicates(newSelectionConfirmed, confirmedSelections)
        const newWord = {word: computerSelected.map(s => s.letter).join(""), owner: turn}
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        setPlayedWords([...playedWords, newWord]) 
        setConfirmedSelections(newBase)
        setTurn('player1')
    }

    const selectLetter = async (letter: string, row: number, column: number, owner: string) => {
        let obj = { letter: letter, row: row, column: column, owner: owner }
        const result: selectionObject = wordService.checkIfLetterSelectionIsallowed(obj, board, selected, turn)
        let newSelected: letterObject[] = []
        if (result.possibleSelection){
            if (result.selectedBeforeIndex === -1){
                newSelected = [...selected, obj]
                setSelected([...selected, obj])
            } else {
                newSelected =  selected.slice(0, result.selectedBeforeIndex)
                setSelected(newSelected)
            }
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

      useEffect(() => {
          if (board.length === 0 ){
            createBoard()
          }  
          if (turn === 'player2'){
              computersTurn()
          }
      }, [turn])

        return  <div className="GameBoard">
                    <div>
                        <h1>GameBoardPage</h1>
                    </div>
                    <div className="BoardAndWordList">
                        <div>
                            <Board letters={board} selectLetter={selectLetter} confirmSelection={confirmSelection} getSelected={getSelected} /> 
                        </div> 
                        <div>
                            <PlayedWordList playedWords={playedWords}/>
                        </div>
                    </div>
                </div>;
    }