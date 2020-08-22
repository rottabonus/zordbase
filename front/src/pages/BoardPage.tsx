import React, {useState, useEffect} from 'react';
import wordService from '../services/words'
import { Board } from '../components/Board'
import { letterObject, selectionObject } from '../types/types'

export const GameBoardPage: React.FC = () => {

    const [board, setBoard] = useState<string[][]>([])
    const [selected, setSelected] = useState<letterObject[]>([])
    const [possibleWords, setpossibleWords] = useState<{[key:string]: string[]}>({});

    const createBoard = () => {
        const board = wordService.createBoard(10, 8)
        setBoard(board)
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

    const getSelected = (r: number, c: number, selected: letterObject[]) => {
        const found = selected.filter(a => a.row === r && a.column === c)
        return found.length === 1
    }

      useEffect(() => {
            createBoard()      
      }, [])

        return  <div>
                    <div>
                        <h1>GameBoardPage</h1>
                    </div>
                    <div>
                        <Board letters={board} selectLetter={selectLetter} getSelected={getSelected} selected={selected}/> 
                    </div> 
                </div>;
    }