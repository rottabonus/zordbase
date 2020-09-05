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

const computerTurn = (confirmedSelections: letterObject[], board: string[][], playedWords: playedWord[]) => {
  console.log('com start selecting')
  const selected = getBestStartingWord(confirmedSelections, board, playedWords)
  const longestWords = selected.sort((a, b) => { return b.length - a.length})
  return  longestWords.length === 0 ? [] :
   longestWords[0].map(s => ({letter: s.letter, row: s.row, column: s.column, owner: 'player2', possibleWords: s.possibleWords}))
}

const updateValues = async (base: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const computerBase = base.filter(l => l.owner === 'player2')
  const playerBase = base.filter(l => l.owner === 'player1')
  for (const [i, letter] of computerBase.entries()) {
    const reCheck = playedWords.length > 0 ? playedWords[playedWords.length-1].word.startsWith(letter.letter) : false
    if( letter.possibleWords === undefined || reCheck){
      computerBase[i].possibleWords = undefined
      computerBase[i].possibleWords = await checkAllPossibleWordsAndRoutes([letter], board, playedWords)
    }
  } 
  return playerBase.concat(computerBase)
}

const getBestStartingWord = (selected: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const computerBase = selected.filter(s => s.owner === 'player2')
  let countOfPossibilities: number = 0
  let longestWord: number = 0
  let selection: letterObject[][] = []
  for (const [i, letter] of computerBase.entries()) { 
    if(letter.possibleWords.length > countOfPossibilities){
      console.log('cur longest possibilities', letter)
      countOfPossibilities = letter.possibleWords.length
      const arraysLongestWord = letter.possibleWords.reduce((max,el,j,arr) => {return el.length>arr[max].length ? j : max;}, 0)
     if(longestWord < arraysLongestWord) {
      console.log('cur longest word!', letter)
       longestWord = arraysLongestWord
       selection = letter.possibleWords
     }
    }
  }
  console.log('returning', selection)
  return selection
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

const checkAllPossibleWordsAndRoutes = async (selected: letterObject[], board: string[][], playedWords: playedWord[]) => {
  const paths: { [key:string]: string[] } = setPaths(selected)
  const realWords: wordObject[] = []
  const movements = generateMovements(board)
  if (selected.length !== 0){
    const playedWordsList: string[] = playedWords.filter(w => w.owner === 'player2').map(s => s.word)
    const allWords: string[] = await fetchAll(selected.map(s => s.letter).join(''))
    const words: string[] = allWords.map(w => w.toUpperCase()).filter(word => !playedWordsList.includes(word))
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
                    //console.log('real word', words.filter(w => w.toUpperCase() === str+toCheck.letter))
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
  return generateSelections(realWords, selected, movements)
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

const getRoute = (word: wordObject, selected: letterObject[], movements: {[key:string]: letterObject[]}) => {
  const queue = []
  const searched: { [key:string] : letterObject } = {}
  queue.push(selected[selected.length-1])
  let curWord = selected.map(s => s.letter).join('')
  let curPos = [selected[selected.length-1].row,  selected[selected.length-1].column]
  let selection = [...selected]
  do {    
      const toCheck = queue.shift()
      searched[`${toCheck.row},${toCheck.column}`] = toCheck
      const neighbors = movements[`${toCheck.row},${toCheck.column}`]
      neighbors.forEach((node) => {
          if (!(`${node.row},${node.column}` in searched)){
              if(word.letters.includes(curWord + node.letter) && checkPosition(node.row, node.column, curPos)){
                  queue.push(...movements[`${node.row},${node.column}`])
                  curWord += node.letter
                  selection.push({row: node.row, column: node.column, letter: node.letter, owner: node.owner})
                  curPos = [node.row, node.column]
                  
                 }
              }
      })
  } while (queue.length > 0)
  return selection
}

const checkPosition = (r: number, c: number, arr: number[]) => {
  return (r-1 === arr[0] || r === arr[0] || r+1 ===arr[0]) && (c-1 === arr[1] || c ===arr[1] || c+1 === arr[1])
}

const generateSelections = (realWords: wordObject[], selected: letterObject[], movements: {[key:string]: letterObject[]}) => {
  const selections: letterObject[][] = [];
  const realWordsSet = realWords.reduce((acc, curr) => { !acc.find(v => v.pos === curr.pos && v.letters === curr.letters) && acc.push(curr); return acc; }, []);
  realWordsSet.forEach((word) => {
      const wordPath: letterObject[] = getRoute(word, selected, movements)
      selections.push(wordPath)
  });
  return selections;
};

export default {
  createBoard,
  checkIfLetterSelectionIsallowed, 
  checkAllPossibleWordsAndRoutes,
  removeDuplicates,
  computerTurn,
  checkIfWin, 
  updateValues
}