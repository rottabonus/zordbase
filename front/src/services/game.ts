import {
  letterObject
} from '../types/types'


const fetchAll = async () => {
    const response = await fetch('http://localhost:3000/api/words/');
    const data = await response.json()
    return data.words
}

const fetchMatch = async (word: string) => {
  if (word !== '') {
    const response = await fetch('http://localhost:3000/api/words/');
    const data = await response.json()
    const result = data.words.filter((a: string) => a.toUpperCase() === word)
    return result.length > 0
  }
  return false
}

const updateOwnersAndRemoveIsolatedNodes = (newSelectionConfirmed: letterObject[], base: letterObject[], board: string[][], turn: string) => {
  const toFilter =  base.filter(array => newSelectionConfirmed.some(filter => filter.row === array.row && filter.column === array.column))
  toFilter.forEach((filter) => {
      const index: number = base.indexOf(filter)
      if (index !== -1) {
        base[index].owner = turn
      }
  })
  return removeIsolatedNodes(base, board, turn)
}


const updateBaseWithPossibleWordTable = (selectedLetters: letterObject[], possibleWordTable: {[key:string]: string[]}, base: letterObject[]) => {
  const word = selectedLetters.map(obj => obj.letter).join('')
  const newBase: letterObject[] = [...base]
  if(word in possibleWordTable){
      const changed: letterObject[] = newBase.map(o => {
        if(checkIfPositionMatches(possibleWordTable[word], o)){
          o = {...o, possibleWords: o.possibleWords.filter(wordArr => wordArr.map(word => word.letter).join('') !== word.substring(1, word.length))}
        }
        return o
      })
      return changed
  }
}

const checkIfPositionMatches = (posArr: string[], obj: letterObject) => {
  for(const position of posArr){
    const posValues = position.split(',')
    if( obj.row.toString() === posValues[0] && obj.column.toString() === posValues[1] ){
      return true
    }
  }
  return false
}

const checkIfWin = (selections: letterObject[], turn: string, max: number) => {
  const win = selections.filter((sel => 
  turn === 'computer' ?  sel.row === 0 : sel.row === max-1))
  return win.length > 0
}

const calculateValues = async (board: string[][], playerName: string) => {
  let base: letterObject[] = []
  const allWords = await fetchAll()
  for(const [j, boardRow] of board.entries()){
    const owner = j === 0 ? playerName :  j === board.length-1 ? 'computer' : 'none'
    const row: letterObject[] = boardRow.map( (letter, column): letterObject => ({'letter': letter, 'row': j, 'column': column, 'owner': owner}))
    base.push(...row)
  }
  for (const [i, letter] of base.entries()) {
    const possibilities = checkAllPossibleWordsAndRoutes(letter, board, allWords)
    base[i].possibleWords =  possibilities
    }
  return base
}

const checkAllPossibleWordsAndRoutes = (letter: letterObject, board: string[][], all: string[]) => {
  const movements = generateMovements(board)
  const possibilities: letterObject[][] = []
  const allWords = all.filter(w => w.toUpperCase().startsWith(letter.letter))
  const words: string[] = allWords.map((w: string) => w.toUpperCase())
  words.forEach( (possibleWord) => {
    const route = getRouteForWord(possibleWord, movements, letter)
    if (route.length > 0) {
      possibilities.push(route.filter((w, i) => i !== 0))
    }
  })
  return possibilities
}

const getRouteForWord = (wordStr: string, movements: {[key:string]: letterObject[]}, obj: letterObject) => {
  const queue = [...movements[getKeyNameObject(obj)]]
  const searched = [obj]
  const selection = [obj]
  let curPos: number[] = [obj.row, obj.column]
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

const getBestWord = (base: letterObject[], turn: string, max: number) => {
  const computerBase = base.filter(s => s.owner === turn)
  const opponentBase = base.filter(s => s.owner !== turn)
  let letterValueArray = [0, 0, 0, 0, 0, 0] //0 possible words starting, 1 word length, 2 letters touching opponents base, 3 letters touching own base, 4 letters touching goal 5 higher than starting pos
  let greatestWordValue = 0
  let selection: letterObject[] = []
  for (const [i, letter] of computerBase.entries()) { 
    if(letter.hasOwnProperty('possibleWords') && letter.possibleWords.length > 0){
      letterValueArray[0] = letter.possibleWords.length //possibilities
      for (const [j, possibleWord] of computerBase[i].possibleWords.entries()){
        letterValueArray[1] = possibleWord.length //word length
        letterValueArray[2] = getCommonElements(opponentBase, possibleWord) * 2.5 //letters touching opp base
        letterValueArray[3] = getCommonElements(computerBase, possibleWord) * (-1) //letters touching own base
        letterValueArray[4] = checkIfWin(possibleWord, turn, max) ? 30 : 0 //if touching goal 20 points
        letterValueArray[5] = getChangeInHeight(possibleWord, turn) * 0.5 //change going upward/downward
        let wordValue = letterValueArray.reduce((acc, curr) => acc+curr)
        if(wordValue > greatestWordValue){
          greatestWordValue = wordValue
          selection = [computerBase[i], ...computerBase[i].possibleWords[j]]
        }
      }
    }
  }
  return selection
}

const getChangeInHeight = (word: letterObject[], turn: string) => {
  const sortedByRow = word.map(s => s.row).sort((a, b) => { return turn === 'computer' ? a - b : b - a})
  return word[0].row - sortedByRow[0]
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
  const baseFilteredFromNone = confirmedSelections.filter(s => s.owner !== 'none')
  const movements = generateMovements(board)
  const attachedNodes: letterObject[] = []
  const searched : { [key:string] : letterObject } = {}
  const nodesToCheck = baseFilteredFromNone.filter(m => m.owner !== turn).sort((a, b) => {
    return turn === 'computer' ? a.row - b.row || a.column - b.column : b.row - a.row || a.column - b.column 
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
  return attachedNodes.concat(confirmedSelections.filter(obj => obj.owner === turn), confirmedSelections.filter(s => s.owner === 'none'))
}

const checkIfLetterSelectionIsallowed = (letter: letterObject, board: string[][], selected: letterObject[], turn: string) => {
  const selectedAgainIndex: number = selected.findIndex(l => l.row == letter.row && l.column == letter.column) 
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

const checkPosition = (r: number, c: number, arr: number[]) => {
  return (r-1 === arr[0] || r === arr[0] || r+1 ===arr[0]) && (c-1 === arr[1] || c ===arr[1] || c+1 === arr[1]) && !(r === arr[0] && c === arr[1])
}

const returnNonPathSearchedNodeIndexes = (searched: letterObject[], obj: letterObject, allMoves: {[key:string]: letterObject[]}, selection: letterObject[], wordStr: string) => {
  const objectMoves = allMoves[`${obj.row},${obj.column}`]
  const toReturnIndexes: number[] = []
  objectMoves.forEach((move) => {
      searched.forEach((pos, i) => {
          if (JSON.stringify(pos) === JSON.stringify(move)) {
              if(selection.findIndex(l => l.row === pos.row && l.column === pos.column) === -1 && wordStr.startsWith(selection.map(s => s.letter).join('')+pos.letter)){
                toReturnIndexes.push(i)
              }
          }
      })
  })
  return toReturnIndexes
}

export default {
  checkIfLetterSelectionIsallowed, 
  updateOwnersAndRemoveIsolatedNodes,
  checkIfWin, 
  getBestWord,
  fetchMatch,
  calculateValues,
  updateBaseWithPossibleWordTable
}