import {
  letterObject
} from '../types/types'

const fetchAll = async (char: string) => {
  let response = await fetch('http://localhost:3000/api/words/');
  let data = await response.json()
  console.log(response.status)
  return data.words.filter((a: string) => a.toUpperCase().startsWith(char))
}

const createBoard = (rows: number, columns: number) => {
  const letters = "abcdefghijklmnoprstuvxyzöä"
  const letterArr = letters.split("")
  const board: string[][] = []
  let rowArray: string[] = []
  for (let i = 0; i <= rows; i++) {
    if (i !== 0) {
      board.push(rowArray)
    }
    rowArray = []
    for (let j = 0; j < columns; j++) {
      rowArray.push(letterArr[getRandomInt(letterArr.length)].toUpperCase())
    }
  }
  return board
}

const getRandomInt = (max: number) => {
  return Math.floor(Math.random() * Math.floor(max));
}

const checkIfWordIsallowed = (letter: letterObject, board: string[][], selected: letterObject[]) => {
  let selectedAgainIndex: number = -1
  if (selected.length !== 0) {
      const possibleXpositions = [selected[selected.length-1].row, selected[selected.length-1].row + 1, selected[selected.length-1].row - 1].filter(x => x >= 0 && x < board.length)
      const possibleYpositions = [selected[selected.length-1].column, selected[selected.length-1].column + 1, selected[selected.length-1].column - 1].filter(x => x >= 0 && x < board.length)
    if (possibleXpositions.includes(letter.row) && possibleYpositions.includes(letter.column)) {
      const isMatch = (l: letterObject) => l.row == letter.row && l.column == letter.column 
      selectedAgainIndex = selected.findIndex(isMatch)
    } else {
      return { possibleSelection: false, selectedBeforeIndex: selectedAgainIndex }
    }
  }
  return { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex}
}

export default {
  fetchAll,
  createBoard,
  checkIfWordIsallowed
}