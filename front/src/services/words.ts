import {
  letterObject
} from '../types/types'

const fetchAll = async (char: string) => {

  console.log('here')
  if (char === '') {
    return []
  }
  let response = await fetch('http://localhost:3000/api/words/');
  let data = await response.json()
  console.log(response.status)
  return data.words.filter((a: string) => a.toUpperCase().startsWith(char))
}

const createBoard = (rows: number, columns: number) => {
  const letters = 'abcdefghijklmnoprstuvxyzöä'
  const letterArr = letters.split('')
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

const checkIfLetterSelectionIsallowed = (letter: letterObject, board: string[][], selected: letterObject[]) => {
  const isMatch = (l: letterObject) => l.row == letter.row && l.column == letter.column 
  let selectedAgainIndex: number = selected.findIndex(isMatch)
  if(selectedAgainIndex !== -1) {
    return { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex }
  } else if (selected.length !== 0) {
      const possibleXpositions = [selected[selected.length-1].row, selected[selected.length-1].row + 1, selected[selected.length-1].row - 1].filter(x => x >= 0 && x < board.length)
      const possibleYpositions = [selected[selected.length-1].column, selected[selected.length-1].column + 1, selected[selected.length-1].column - 1].filter(x => x >= 0 && x < (board[0].length))
    if (!possibleXpositions.includes(letter.row) && !possibleYpositions.includes(letter.column)) {
      return { possibleSelection: false, selectedBeforeIndex: selectedAgainIndex }
    }
  }

  return { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex}
}

const generateMovements = (board: string[][]) => {
  const moves: { [key:string] : letterObject[] } = {}
  board.forEach((row, r) => {
      row.forEach((column, c) => {
          moves[`${r},${c}`] = getNeighborsData({'letter': board[r][c], 'row': r, 'column': c}, board)
      })
  })
  return moves
}

const getKeyNameObject = (obj: letterObject) => {
  return `${obj.row},${obj.column}`
}

const getNeighborsData = (selected: letterObject, board: string[][]) => {
  let possibleCoordinates: letterObject[] = []
  const possibleXpositions: number[] = [selected.row, selected.row + 1, selected.row - 1].filter(x => x >= 0 && x < board.length)
  const possibleYpositions: number[] = [selected.column, selected.column + 1, selected.column - 1].filter(x => x >= 0 && x < (board[0].length)) 
  possibleXpositions.forEach( (xPos) => {
        possibleYpositions.forEach( (yPos) => {
        if(!(xPos === selected.row && yPos === selected.column)){
            possibleCoordinates.push({'row':xPos, 'column':yPos, 'letter':board[xPos][yPos]})
        }
        })
      })
     return possibleCoordinates
}

const checkAllPossibleWordsAndRoutes = async (selected: letterObject[], board: string[][]) => {
  const words: string[] = await fetchAll(selected.map(s => s.letter).join(''))
  const movements = generateMovements(board)
  const queue = [...movements[getKeyNameObject(selected[selected.length-1])]]
  const searched = [...selected]
  let paths: { [key:string]: string[] } = {}
  paths[getKeyNameObject(selected[selected.length-1])] = [...selected[selected.length-1].letter]

  do {
    
    const toCheck = queue.shift()
    const parents = findParent(toCheck, paths, movements)

    if (parents.length > 0){
      const isMatch = (l: letterObject) => l.row === toCheck.row && l.column === toCheck.column
      if (searched.findIndex(isMatch) === -1){
        queue.push(...movements[getKeyNameObject(toCheck)])
        searched.push(toCheck)
        parents.forEach( (parent) => {
            parent.forEach( (str) => {
              if(words.filter(w => w.toUpperCase().includes(str+toCheck.letter)).length > 0){
                let moves = paths[getKeyNameObject(toCheck)]
                moves === undefined ? moves = [] : moves
                paths[getKeyNameObject(toCheck)] = [...moves, str+toCheck.letter]
                const reSearchable: number[] = returnPossibleNeighborsToQueue(searched, toCheck, movements, paths)
                reSearchable.forEach( (node) => {
                  searched.splice(node, 1)
              })
            } 
          })
        })  
      }
    }
    } while (queue.length > 0)

  return paths
}

const returnPossibleNeighborsToQueue = (searched: letterObject[], obj: letterObject, allMoves: {[key:string]: letterObject[]}, paths: {[key:string]: string[]}) => {
//debugger;
const objectMoves: letterObject[] = allMoves[getKeyNameObject(obj)]
const toReturnIndexes: number[] = []
objectMoves.forEach( (move) => {
  searched.forEach( (searched, i) => {
    if(JSON.stringify(searched) === JSON.stringify(move)){
      let moves = paths[getKeyNameObject(move)]
      if (moves === undefined){
        toReturnIndexes.push(i)
      }
    }
  })
})
return toReturnIndexes
}

const findParent = (obj: letterObject, parentMoves: {[key:string]: string[]}, allMoves: {[key:string]: letterObject[]}) => {
  const objectMoves: letterObject[] = allMoves[getKeyNameObject(obj)]
  let parents: string[][] = []
  const movePositions: string[] = objectMoves.map(p => getKeyNameObject(p))
  Object.keys(parentMoves).forEach( (parent) => {
    parents.push(...movePositions.filter(pos => pos === parent).map(moveArray => parentMoves[moveArray]))
  })
 return parents
}

export default {
  fetchAll,
  createBoard,
  checkIfLetterSelectionIsallowed, 
  checkAllPossibleWordsAndRoutes
}