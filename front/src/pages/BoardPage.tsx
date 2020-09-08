import React, { useState, useEffect, useRef } from 'react'
import wordService from '../services/words'
import { Board } from '../components/Board'
import { PlayedWordList } from '../components/PlayedWordList'
import { letterObject, selectionObject, playedWord } from '../types/types'
import { useSelector, useDispatch } from 'react-redux'
import allActions from '../actions/allActions'
import { RootState } from '../reducers/combineReducer'

export const GameBoardPage: React.FC = () => {

    const [selected, setSelected] = useState<letterObject[]>([])
    //const [possibleWords, setpossibleWords] = useState<letterObject[][]>([])
    const [turn, setTurn] = useState<string>('player1')
    const [playedWords, setPlayedWords] = useState<playedWord[]>([])
    const [gameOver, setGameOver] = useState<boolean>(true) 
    const board = useSelector((state: RootState) => state.board.board)
    const confirmedSelections = useSelector((state: RootState) => state.base.base)

    const createBases = () => {
        const playerOneBase = board[0].map( (letter, column) => ({'letter': letter, 'row': 0, 'column': column, 'owner': 'player1'}))
        const playerTwoBase = board[board.length-1].map( (letter, column) => ({'letter': letter, 'row': board.length-1, 'column': column, 'owner': 'player2'}))
        dispatch(allActions.baseActions.updateBase(playerOneBase.concat(playerTwoBase)))
    }
    const gameChange = () => {
        setTimeout(() => {
            alert(`winner is ${turn}`)
            startNewGame()
        }, 2000);
    }

    const startNewGame = () => {   
        setPlayedWords([])
        setGameOver(true)
        dispatch(allActions.boardActions.createBoard())
    }

    const confirmSelection = () => {
        const newSelectionConfirmed = selected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: []}))
        const confirmedAndFiltered = wordService.removeDuplicates(newSelectionConfirmed, confirmedSelections, board, turn)
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        const checkGame = wordService.checkIfWin(newSelectionConfirmed, turn, board.length)
        setPlayedWords([...playedWords, {word: selected.map(s => s.letter).join(''), owner: turn}]) 
        dispatch(allActions.baseActions.updateBase(newBase))
        setSelected([])
        checkGame ? gameChange() : setTurn('player2')          
    }

    const computersTurn = async () => {
        const updateSelections = await wordService.updateValues(confirmedSelections, board, playedWords.filter(f => f.owner === turn), turn)
        const computerSelected = wordService.getBestWord(updateSelections, turn, board.length)
        const newSelectionConfirmed = computerSelected.map(s => ({'letter': s.letter, 'row': s.row, 'column': s.column, 'owner': turn, possibleWords: s.possibleWords}))
        const confirmedAndFiltered = wordService.removeDuplicates(newSelectionConfirmed, updateSelections, board, turn)
        const newBase = confirmedAndFiltered.concat(newSelectionConfirmed)
        const checkGame = wordService.checkIfWin(newSelectionConfirmed, turn, board.length)
        setPlayedWords([...playedWords, {word: computerSelected.map(s => s.letter).join(''), owner: turn}]) 
        dispatch(allActions.baseActions.updateBase(newBase))
        if (checkGame){
            setTurn('player1')
            gameChange()
        } else {
            setTurn('player1')
        }       
    }

    const selectLetter = async (letter: string, row: number, column: number, owner: string) => {
        let obj = { letter: letter, row: row, column: column, owner: owner}
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

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }

      useEffect(() => {
        scrollToBottom()
          if (gameOver){
            createBases()
            setGameOver(false)
          }  
          if (turn === 'player2'){
              computersTurn()
          }
      }, [turn, gameOver])

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
                            <PlayedWordList playedWords={playedWords} messagesEndRef={messagesEndRef }/>
                        </div>
                    </div>
                </div>;
    }