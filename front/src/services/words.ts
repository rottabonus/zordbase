import {
  letterObject, 
  wordObject,
  playedWord
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

const removeDuplicates = (newSelectionConfirmed: letterObject[], confirmedSelections: letterObject[], board: string[][], turn: string) => {
        const toFilter =  confirmedSelections.filter(array => newSelectionConfirmed.some(filter => filter.row === array.row && filter.column === array.column))
        toFilter.forEach((filter) => {
            const index = confirmedSelections.indexOf(filter)
            if (index !== -1) {
              confirmedSelections.splice(index, 1)
            }
        })
        return removeIsolatedNodes(confirmedSelections, board, turn)
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

const computerTurn =  async (confirmedSelections: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const selected: letterObject[] =  []
  const firstLetter = await selectFirstLetter(confirmedSelections, board, playedWords)
  selected.push(firstLetter)
  let searching = true
  console.log('first letter is', firstLetter)
  do {
    const nextLetter = await selectNextLetter(selected, board, playedWords)
    if (nextLetter === null){
      searching = false
    } else {
      selected.push(nextLetter)
    }  
  } while (searching)
  return selected.map(s => ({letter: s.letter, row: s.row, column: s.column, owner: 'player2'}))
}

const removeIsolatedNodes = (confirmedSelections: letterObject[], board: string[][], turn: string) => {
  const queue = []
  const movements = generateMovements(board)
  const attachedNodes: letterObject[] = []
  const searched : { [key:string] : letterObject } = {}
  const nodesToCheck = confirmedSelections.filter(m => m.owner !== turn).sort((a, b) => {
    return turn === 'player2' ? a.row - b.row || a.column - b.column : b.row - a.row || a.column - b.column 
  })
  queue.push(nodesToCheck[0])
  do {
    const toCheck = queue.shift()
    const neighbors = movements[`${toCheck.row},${toCheck.column}`]
    neighbors.forEach((node) => {
      if (!(`${node.row},${node.column}` in searched)){
        searched[`${node.row},${node.column}`] = node
        const nodeIndex = nodesToCheck.findIndex(obj => obj.row === node.row && obj.column === node.column)
          if(nodeIndex !== -1){
            attachedNodes.push(nodesToCheck[nodeIndex])
            queue.push(nodesToCheck[nodeIndex])
        }
      }
    })
  } while (queue.length > 0)
  return attachedNodes.concat(confirmedSelections.filter(obj => obj.owner === turn))
}

const selectFirstLetter = async (selected: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const computerBase = selected.filter(s => s.owner === 'player2')
  let countOfPossibilities: number = 0
  let longestWord: number = 0
  let bestIndex: number = 0
  for (const [i, letter] of computerBase.entries()) { 
    const possibilities =  await checkAllPossibleWordsAndRoutes([letter], board, playedWords)
    if(possibilities.length > countOfPossibilities){
      countOfPossibilities = possibilities.length
      const arraysLongestWord = possibilities.reduce((max,el,j,arr) => {return el.length>arr[max].length ? j : max;}, 0)
     if(longestWord < arraysLongestWord) {
       longestWord = arraysLongestWord
      bestIndex = i
     }
    }
  }
  return computerBase[bestIndex]

}

const selectNextLetter =  async (selected: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const possibilities = await checkAllPossibleWordsAndRoutes(selected, board, playedWords)
  if(possibilities.length === 0){
    return null
  }
  let longestWord: number = 0
  let longestWordIndex: number = 0
  for (const [i, word] of possibilities.entries()){
    if (word.length > longestWord){
      longestWordIndex = i
      longestWord = word.length
    }
  }
  return possibilities[longestWordIndex][selected.length]
}


const checkIfLetterSelectionIsallowed = (letter: letterObject, board: string[][], selected: letterObject[], turn: string) => {
  let selectedAgainIndex: number = selected.findIndex(l => l.row == letter.row && l.column == letter.column) 
  if (selected.length === 0){
    return (letter.owner === turn) ?  { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex} : { possibleSelection: false, selectedBeforeIndex: selectedAgainIndex}
 }
      const possibleXpositions = [selected[selected.length-1].row, selected[selected.length-1].row + 1, selected[selected.length-1].row - 1].filter(x => x >= 0 && x < board.length)
      const possibleYpositions = [selected[selected.length-1].column, selected[selected.length-1].column + 1, selected[selected.length-1].column - 1].filter(x => x >= 0 && x < (board[0].length))
      if ( possibleXpositions.includes(letter.row) && possibleYpositions.includes(letter.column)) {
        return { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex }
      }
  return  selectedAgainIndex === -1 ? { possibleSelection: false, selectedBeforeIndex: selectedAgainIndex} : { possibleSelection: true, selectedBeforeIndex: selectedAgainIndex }
}

const generateMovements = (board: string[][]) => {
  const moves: { [key:string] : letterObject[] } = {}
  board.forEach((row, r) => {
      row.forEach((column, c) => {
          moves[`${r},${c}`] = getNeighborsData({'letter': board[r][c], 'row': r, 'column': c, 'owner': 'none'}, board)
      })
  })
  return moves
}

const getKeyNameObject = (obj: letterObject) => {
  return `${obj.row},${obj.column}`
}

const getNeighborsData = (node: letterObject, board: string[][]) => {
  const possibleMoves: letterObject[] = []
  const possibleXpositions: number[] = [node.row, node.row + 1, node.row - 1].filter(x => x >= 0 && x < board.length)
  const possibleYpositions: number[] = [node.column, node.column + 1, node.column - 1].filter(x => x >= 0 && x < (board[0].length)) 
  possibleXpositions.forEach( (xPos) => {
        possibleYpositions.forEach( (yPos) => {
        if(!(xPos === node.row && yPos === node.column)){
          possibleMoves.push({'row':xPos, 'column':yPos, 'letter':board[xPos][yPos], 'owner': 'none'})
        }
      })
    })
  return possibleMoves
}

const checkAllPossibleWordsAndRoutes = async (selected: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const paths: { [key:string]: string[] } = setPaths(selected)
  const realWords: wordObject[] = []
  if (selected.length !== 0){
    const playedWordsList: string[] = playedWords.filter(w => w.owner === 'player2').map(s => s.word)
    const allWords: string[] = await fetchAll(selected.map(s => s.letter).join(''))
    const words: string[] = allWords.map(w => w.toUpperCase()).filter(word => !playedWordsList.includes(word))
    const movements = generateMovements(board)
    const queue: letterObject[] = [...movements[getKeyNameObject(selected[selected.length-1])]]
    const searched: letterObject[] = [...selected]
    
    do {

        const toCheck = queue.shift()
        const parentPaths = findParentPaths(toCheck, paths, movements)
        if (parentPaths.length > 0){
          if (searched.findIndex(l => l.row === toCheck.row && l.column === toCheck.column) === -1){
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
  console.log('setting paths', selected)
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
  const selected_str = selected.map(s => s.letter).join('')
  const realWordsSet = realWords.reduce((acc, curr) => { 	!acc.find(v => v.pos === curr.pos && v.letters === curr.letters)  && acc.push(curr);     return acc; }, []);
  realWordsSet.forEach( (word) => {
    const letters = word.letters.split('')
    const wordSelection = []
    if (selected_str !== word.letters) {
      wordSelection.push({'row': Number(`${word.pos.slice(0,1)}`), 'column': Number(`${word.pos.slice(2,4)}`), 'letter': letters[letters.length-1].toUpperCase(), 'owner': 'none'})
    for (let i = letters.length-2; i >= selected.length; i--){
      const position = getPositionForLetter(letters, wordSelection, paths)
      wordSelection.push({'row': Number(`${position.slice(0,1)}`), 'column': Number(`${position.slice(2,4)}`), 'letter': letters[i].toUpperCase(), 'owner': 'none'})
    }
    wordSelection.reverse().unshift(...selected)
    selections.push(wordSelection)
  }
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
  removeDuplicates,
  computerTurn
}