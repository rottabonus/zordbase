import {
  letterObject, 
  wordObject,
  letterObjectOwner,
  playerTurn,
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

const removeDuplicates = (newSelectionConfirmed: letterObjectOwner[], confirmedSelections: letterObjectOwner[]) => {
        const toFilter =  confirmedSelections.filter(array => newSelectionConfirmed.some(filter => filter.row === array.row && filter.column === array.column))
        toFilter.forEach((filter) => {
            const index = confirmedSelections.indexOf(filter)
            if (index !== -1) {
              confirmedSelections.splice(index, 1)
            }
        })
        return confirmedSelections
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
  if (selected.length !== 0 && selectedAgainIndex === -1) {
      const possibleXpositions = [selected[selected.length-1].row, selected[selected.length-1].row + 1, selected[selected.length-1].row - 1].filter(x => x >= 0 && x < board.length)
      const possibleYpositions = [selected[selected.length-1].column, selected[selected.length-1].column + 1, selected[selected.length-1].column - 1].filter(x => x >= 0 && x < (board[0].length))
      if ( possibleXpositions.includes(letter.row) && !possibleYpositions.includes(letter.column)  ||
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
  const realWords: wordObject[] = []
  if (selected.length !== 0){
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
                    realWords.push(...words.filter(w => w.toUpperCase() === str+toCheck.letter).map(word => ({ 'letters' : word, 'pos':`${toCheck.row},${toCheck.column}`}) ))
                    let moves = paths[`${toCheck.row},${toCheck.column}`]
                    moves === undefined || moves.includes(str+toCheck.letter) ? moves = [] : moves
                    paths[`${toCheck.row},${toCheck.column}`] = [...moves, str+toCheck.letter]
                    const reSearchable: number[] = returnNonPathSearchedNodeIndexes(searched, toCheck, movements, paths)
                    reSearchable.forEach( (nodeIndex) => {
                      searched.splice(nodeIndex, 1)
                      const returned = searched.splice(nodeIndex, 1)
                      queue.unshift(...returned)
                  })
                } 
              })
            })  
          }
        }
      } while (queue.length > 0)
    }
  return generateSelections(paths, realWords, selected)
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

const returnNonPathSearchedNodeIndexes = (searched: letterObject[], obj: letterObject, allMoves: {[key:string]: letterObject[]}, paths: {[key:string]: string[]}) => {
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

const generateSelections = (paths: { [key:string]: string[] }, realWords: wordObject[], selected: letterObject[]) => {
  const selections: letterObject[][] = []
  const realWordsSet = realWords.reduce((acc, curr) => { 	!acc.find(v => v.pos === curr.pos && v.letters === curr.letters)  && acc.push(curr);     return acc; }, []);
  realWordsSet.forEach( (word) => {
    const letters = word.letters.split('')
    let wordSelection = [{'row': Number(`${word.pos.slice(0,1)}`), 'column': Number(`${word.pos.slice(2,4)}`), 'letter': letters[letters.length-1].toUpperCase()}]
    for (let i = letters.length-2; i >= selected.length; i--){
      const position = getPositionForLetter(letters, wordSelection, paths)
      wordSelection.push({'row': Number(`${position.slice(0,1)}`), 'column': Number(`${position.slice(2,4)}`), 'letter': letters[i].toUpperCase()})
    }
    wordSelection.reverse().unshift(...selected)
    selections.push(wordSelection)
  })
  return selections
  }
  
  const getPositionForLetter = (letters: string[], selected: letterObject[], paths: {[key:string]: string[]}) => {
    const currentWord = selected.map(s => s.letter).join('')
    const keys = Object.keys(paths)
    for(const pos of keys){
        for(const path of paths[pos]){
          const Okposition = checkPosition(pos, selected[selected.length-1])
          const OkPath = checkLetters(path, currentWord, letters)
        if (OkPath && Okposition ) {
            return pos
        } 
      } 
    }
    return 'X,X'
  }
  
  const checkLetters = (path: string, currentWord: string, letters: string[]) => {
    return path + currentWord.split('').reverse().join('') === letters.join('').toUpperCase()
  }
  
  const checkPosition = (pos: string, obj: letterObject) => {
    const row = Number(pos.slice(0,1))
    const column = Number(pos.slice(2,4))
    return !(row === obj.row && column === obj.column) && (row-1 === obj.row || row === obj.row || row+1 === obj.row) && (column-1 === obj.column || column === obj.column || column+1 === obj.column)
  }

export default {
  createBoard,
  checkIfLetterSelectionIsallowed, 
  checkAllPossibleWordsAndRoutes,
  removeDuplicates
}