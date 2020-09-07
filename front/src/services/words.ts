import {
  letterObject, 
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

const createBoard = (rows: number, columns: number) => {
  const letters = 'aaaabcdeeeefghhhiiiijjjkkklllmnmnnnooooppprrrssstttuuuuvvyöääää'
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

const checkIfWin = (selections: letterObject[], turn: string, max: number) => {
  const win = selections.filter((sel => 
  turn === 'player1' ? sel.row === max-1 : sel.row === 0))
  return win.length > 0
}

const updateValues = async (base: letterObject[], board: string[][], playedWords: playedWord[], turn: string) => {
  for (const [i, letter] of base.entries()) {
    const reCheck = playedWords.length > 0 ? playedWords[playedWords.length-1].word.startsWith(letter.letter) : false
    if( letter.possibleWords === undefined || reCheck){
      base[i].possibleWords = undefined
      base[i].possibleWords = await checkAllPossibleWordsAndRoutes([letter], board, playedWords, turn)
    }
  } 
  return base
}

const getBestWord = (base: letterObject[], turn: string, max: number) => {
  const computerBase = base.filter(s => s.owner === turn)
  const opponentBase = base.filter(s => s.owner !== turn)
  let letterValueArray = [0, 0, 0, 0, 0, 0] //0 possible words starting, 1 word length, 2 letters touching opponents base, 3 letters touching own base, 4 letters touching goal 5 higher than starting pos
  let greatestWordValue = 0
  let selection: letterObject[] = []
  for (const [i, letter] of computerBase.entries()) { 
    if(letter.hasOwnProperty('possibleWords') && letter.possibleWords.length > 0){
      letterValueArray[0] = letter.possibleWords.length
      for (const [j, possibleWord] of computerBase[i].possibleWords.entries()){
        letterValueArray[1] = possibleWord.length
        letterValueArray[2] = getCommonElements(opponentBase, possibleWord) * 2
        letterValueArray[3] = getCommonElements(computerBase, possibleWord) * (-1)
        letterValueArray[4] = checkIfWin(possibleWord, turn, max) ? 20 : 0
        letterValueArray[5] = getChangeInHeight(possibleWord) * 0.5
        let wordValue = letterValueArray.reduce((acc, curr) => acc+curr)
        if(wordValue > greatestWordValue){
          greatestWordValue = wordValue
          selection = computerBase[i].possibleWords[j]
        }
      }
    }
  }
  return selection
}

const getChangeInHeight = (word: letterObject[]) => {
  const sortedByRow = word.map(s => s).sort((a, b) => { return a.row - b.row })
  return word[0].row - sortedByRow[0].row
}

const getCommonElements = (base: letterObject[], word: letterObject[]) => {
let commonElements: { [key:string] : boolean }  = {}
let commonIterator = 0
for(const [i, obj] of base.entries()){
  if(!commonElements[`${obj.row},${obj.column}`]){
    commonElements[`${obj.row},${obj.column}`] = true
  }
}
for(const [j, obj] of word.entries()){
  if(commonElements[`${obj.row},${obj.column}`]){
    commonIterator++
  }
}
return commonIterator
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

const checkAllPossibleWordsAndRoutes = async (selected: letterObject[], board: string[][], playedWords: playedWord[], turn: string) => {
  const movements = generateMovements(board)
  const playedWordsList: string[] = playedWords.filter(w => w.owner === turn).map(s => s.word)
  const possibilities: letterObject[][] = []
  const allWords = await fetchAll(selected.map(s => s.letter).join(''))
  const words: string[] = allWords.map((w: string) => w.toUpperCase()).filter((word: string) => !playedWordsList.includes(word))
  words.forEach( (possibleWord) => {
    const route = getRouteForWord(possibleWord, movements, selected)
    if (route.length > 0) {
      possibilities.push(route)
    }
  })
  return possibilities
};

const getRouteForWord = (wordStr: string, movements: {[key:string]: letterObject[]}, obj: letterObject[]) => {
  const queue = [...movements[getKeyNameObject(obj[obj.length - 1])]]
  const searched = [...obj]
  const selection = [...obj]
  let curPos: number[] = [obj[obj.length - 1].row, obj[obj.length - 1].column]
  do {
    const toCheck = queue.shift()
    const curWord = selection.map(s => s.letter).join('')
    if(searched.findIndex(l => l.row === toCheck.row && l.column === toCheck.column) === -1){
      if (wordStr.includes(curWord+toCheck.letter) && checkPosition(toCheck.row, toCheck.column, curPos)){
        selection.push(toCheck)
        curPos = [toCheck.row, toCheck.column]
        queue.push(...movements[`${toCheck.row},${toCheck.column}`])
        if(wordStr === curWord+toCheck.letter){
          return selection
        }
        const reSearchable = returnNonPathSearchedNodeIndexes(searched, toCheck, movements, selection, wordStr)
        reSearchable.forEach((nodeIndex) => {
        searched.splice(nodeIndex, 1)
        const returned = searched.splice(nodeIndex, 1)
        queue.unshift(...returned)
        })
      }
    }
    searched.push(toCheck)
  } while (queue.length > 0)
  return []
}

const checkPosition = (r: number, c: number, arr: number[]) => {
  return (r-1 === arr[0] || r === arr[0] || r+1 ===arr[0]) && (c-1 === arr[1] || c ===arr[1] || c+1 === arr[1]) && !(r === arr[0] && c === arr[1])
}

const returnNonPathSearchedNodeIndexes = (searched: letterObject[], obj: letterObject, allMoves: {[key:string]: letterObject[]}, selection: letterObject[], wordStr: string) => {
  const objectMoves = allMoves[`${obj.row},${obj.column}`]
  const toReturnIndexes: number[] = []
  objectMoves.forEach((move) => {
      searched.forEach((pos, i) => {
          if (JSON.stringify(pos) === JSON.stringify(move)) {
              //console.log('this one to return possibly', pos)
              if(selection.findIndex(l => l.row === pos.row && l.column === pos.column) === -1 && wordStr.startsWith(selection.map(s => s.letter).join('')+pos.letter)){
                toReturnIndexes.push(i)
              }
          }
      })
  })
  return toReturnIndexes
}

  
export default {
  createBoard,
  checkIfLetterSelectionIsallowed, 
  checkAllPossibleWordsAndRoutes,
  removeDuplicates,
  checkIfWin, 
  updateValues,
  getBestWord
}