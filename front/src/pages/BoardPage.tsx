import React, {useState, useEffect} from 'react';
import wordService from '../services/words'
import { Board } from '../components/Board'
import { letterObject, selectionObject } from '../types/types'

export const GameBoardPage: React.FC = () => {

    const [words, setWords] = useState<string[] | undefined>(undefined);
    const [board, setBoard] = useState<string[][]>([])
    const [selected, setSelected] = useState<letterObject[]>([])
    const [selectedStr, setSelectedStr] = useState<string | undefined>(undefined);

    const fetchData = async (letter: string) => {
        const words = await wordService.fetchAll(letter)
        setWords(words)       
      }

    const createBoard = () => {
        const board = wordService.createBoard(10, 8)
        setBoard(board)
    }

    const selectLetter = async (letter: string, row: number, column: number) => {
        let obj = { letter: letter, row: row, column: column }
        const result: selectionObject = wordService.checkIfWordIsallowed(obj, board, selected)
        if (result.possibleSelection){
            if (result.selectedBeforeIndex === -1){
                setSelected([...selected, obj])
            } else {
                const newSelected =  selected.slice(0, result.selectedBeforeIndex)
                setSelected(newSelected)
        }
    }
        const selectedStr = selected.map(s => s.letter).join("")
        setSelectedStr(selectedStr)
        //fetchData(selectedStr)  
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
                        <Board letters={board} selectLetter={selectLetter} get={getSelected} selected={selected}/> 
                    </div> 
                </div>;
    }