import React, {useState, useEffect} from 'react';
import wordService from '../services/words'
import { Board } from '../components/Board'
import { letterObject, selectionObject, playerTurn, letterObjectOwner } from '../types/types'

export const GameBoardPage: React.FC = () => {

    const [board, setBoard] = useState<string[][]>([])
    const [selected, setSelected] = useState<letterObject[]>([])
    const [possibleWords, setpossibleWords] = useState<letterObject[][]>([])
    const [playerOneBase, setPlayerOneBase] = useState<letterObjectOwner[]>([])
    const [playerTwoBase, setPlayerTwoBase] = useState<letterObjectOwner[]>([])
    const [turn, setTurn] = useState<playerTurn>('player1')

    const createBoard = () => {
        const board = wordService.createBoard(10, 8)
        setBoard(board)
    }

    const confirmSelection = () => {
        const newSelectionConfirmed = selected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn}))
        if (turn === 'player1'){
            const newBase = playerOneBase.concat(newSelectionConfirmed)
            setPlayerOneBase(newBase)
            setTurn('player2')
        } else {
            const newBase = playerTwoBase.concat(newSelectionConfirmed)
            setPlayerTwoBase(newBase)
            setTurn('player1')
        }
        setSelected([])
    }

    const selectLetter = async (letter: string, row: number, column: number) => {
        let obj = { letter: letter, row: row, column: column }
        const result: selectionObject = wordService.checkIfLetterSelectionIsallowed(obj, board, selected)
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
        const selectedWithOwner: letterObjectOwner[] = selected.map(s => ({'row':s.row, 'column': s.column, 'letter': s.letter, 'owner': turn}))
        const allSelected = selectedWithOwner.concat(playerOneBase, playerTwoBase)
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