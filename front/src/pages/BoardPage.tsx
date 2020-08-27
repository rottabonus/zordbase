import React, {useState, useEffect} from 'react';
import wordService from '../services/words'
import { Board } from '../components/Board'
import { letterObject, selectionObject } from '../types/types'

export const GameBoardPage: React.FC = () => {

    const [board, setBoard] = useState<string[][]>([])
    const [selected, setSelected] = useState<letterObject[]>([])
    const [possibleWords, setpossibleWords] = useState<letterObject[][]>([])
    const [confirmedSelections, setConfirmedSelections] = useState<letterObject[]>([])
    const [turn, setTurn] = useState<string>('player1')

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
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        setConfirmedSelections(newBase)
        setSelected([])
        if (turn === 'player1'){
            setTurn('player2')
        } else {
            setTurn('player1')
        }
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
    const possibleWords = await wordService.checkAllPossibleWordsAndRoutes(newSelected, board)
    setpossibleWords(possibleWords)
    }

    const getSelected = (r: number, c: number) => {
        const selectedWithOwner: letterObject[] = selected.map(s => ({'row':s.row, 'column': s.column, 'letter': s.letter, 'owner': turn}))
        const allSelected = selectedWithOwner.concat(confirmedSelections)
        const found = allSelected.filter(a => a.row === r && a.column === c)
        if (found.length === 0){
            return 'none'
        }
        return found[0].owner
    }

      useEffect(() => {
            createBoard()      
      }, [])

        return  <div>
                    <div>
                        <h1>GameBoardPage</h1>
                    </div>
                    <div>
                        <Board letters={board} selectLetter={selectLetter} confirmSelection={confirmSelection} getSelected={getSelected} /> 
                    </div> 
                </div>;
    }