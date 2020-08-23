import {
  letterObject
} from '../types/types'

const fetchAll = async (char: string) => {
  if (char !== '') {
    const response = await fetch('http://localhost:3000/api/words/');
    const data = await response.json()
    //console.log(response.status)
    return data.words.filter((a: string) => a.toUpperCase().startsWith(char))
  }
  return []
}

const createBoard = (rows: number, columns: number) => {
  const letters = 'aaabcdeeefghhiiiijjkkllmmnnoopprrssttuuuvvxyzööäää'
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
  if (selected.length !== 0) {
      const possibleXpositions = [selected[selected.length-1].row, selected[selected.length-1].row + 1, selected[selected.length-1].row - 1].filter(x => x >= 0 && x < board.length)
      const possibleYpositions = [selected[selected.length-1].column, selected[selected.length-1].column + 1, selected[selected.length-1].column - 1].filter(x => x >= 0 && x < (board[0].length))
      if (!possibleXpositions.includes(letter.row) && !possibleYpositions.includes(letter.column) || 
       possibleXpositions.includes(letter.row) && !possibleYpositions.includes(letter.column)  ||
       !possibleXpositions.includes(letter.row) && possibleYpositions.includes(letter.column)) {
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
  const possibleMoves: letterObject[] = []
  const possibleXpositions: number[] = [selected.row, selected.row + 1, selected.row - 1].filter(x => x >= 0 && x < board.length)
  const possibleYpositions: number[] = [selected.column, selected.column + 1, selected.column - 1].filter(x => x >= 0 && x < (board[0].length)) 
  possibleXpositions.forEach( (xPos) => {
        possibleYpositions.forEach( (yPos) => {
        if(!(xPos === selected.row && yPos === selected.column)){
          possibleMoves.push({'row':xPos, 'column':yPos, 'letter':board[xPos][yPos]})
        }
        })
      })
     return possibleMoves
}

const checkAllPossibleWordsAndRoutes = async (selected: letterObject[], board: string[][]) => {
  const paths: { [key:string]: string[] } = setPaths(selected)
  if (selected.length != 0){
    const words: string[] = await fetchAll(selected.map(s => s.letter).join(''))
    const movements = generateMovements(board)
    const queue = [...movements[getKeyNameObject(selected[selected.length-1])]]
    const searched = [...selected]
    
    do {
    
        const toCheck = queue.shift()
        const parentPaths = findParentPaths(toCheck, paths, movements)
        if (parentPaths.length > 0){
          const isMatch = (l: letterObject) => l.row === toCheck.row && l.column === toCheck.column
          if (searched.findIndex(isMatch) === -1){
            queue.push(...movements[`${toCheck.row},${toCheck.column}`])
            searched.push(toCheck)
            parentPaths.forEach( (pathArr) => {
              pathArr.forEach( (str) => {
                  if(words.filter(w => w.toUpperCase().startsWith(str+toCheck.letter)).length > 0){
                    let moves = paths[`${toCheck.row},${toCheck.column}`]
                    moves === undefined ? moves = [] : moves
                    paths[`${toCheck.row},${toCheck.column}`] = [...moves, str+toCheck.letter]
                    const reSearchable: number[] = returnPossibleNeighborsToQueue(searched, toCheck, movements, paths)
                    reSearchable.forEach( (nodeIndex) => {
                      searched.splice(nodeIndex, 1)
                      const queueIndex =  queue.length - movements[`${toCheck.row},${toCheck.column}`].length
                      const elementsToShift = movements[`${toCheck.row},${toCheck.column}`].length
                      queue.unshift(...queue.splice(queueIndex, elementsToShift))
                  })
                } 
              })
            })  
          }
        }
      } while (queue.length > 0)
    }
  return paths
}

const setPaths = (selected: letterObject[]) => {
  const paths: { [key:string]: string[] } = {}
  let acc: string = ''
  selected.forEach( (node) => {
    paths[`${node.row},${node.column}`] = [acc+node.letter]
    acc =  acc + node.letter
  })
  return paths
}

const returnPossibleNeighborsToQueue = (searched: letterObject[], obj: letterObject, allMoves: {[key:string]: letterObject[]}, paths: {[key:string]: string[]}) => {
const objectMoves: letterObject[] = allMoves[`${obj.row},${obj.column}`]
const toReturnIndexes: number[] = []
objectMoves.forEach( (move) => {
  searched.forEach( (searched, i) => {
    if(JSON.stringify(searched) === JSON.stringify(move)){
      const moves = paths[`${move.row},${move.column}`]
      if (moves === undefined){
        toReturnIndexes.push(i)
      }
    }
  })
})
return toReturnIndexes
}

const findParentPaths = (obj: letterObject, parentMoves: {[key:string]: string[]}, allMoves: {[key:string]: letterObject[]}) => {
  const parentPaths: string[][] = []
  const objectMoves = allMoves[`${obj.row},${obj.column}`]
  const movePositions = objectMoves.map(p => getKeyNameObject(p))
  movePositions.forEach( (move) => {
    if (parentMoves[move] !== undefined ){
      parentPaths.push(parentMoves[move])
    }
  })
  return parentPaths
}

export default {
  createBoard,
  checkIfLetterSelectionIsallowed, 
  checkAllPossibleWordsAndRoutes
}