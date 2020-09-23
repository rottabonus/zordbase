import {
  letterObject
} from '../types/types'

const updateOwnersAndRemoveIsolatedNodes = (newSelectionConfirmed: letterObject[], base: letterObject[], board: string[][], turn: string) => {
  const filtered =  base.map(o => {
    if(checkIfExistInSelection(newSelectionConfirmed, o)){
      o = {...o, owner: turn}
    }
    return o
  })
  return removeIsolatedNodes(filtered, board, turn)
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
  } while (queue.length)
  const neutralNodes = confirmedSelections.filter(s => s.owner === 'none')
  const turnNodes = confirmedSelections.filter(obj => obj.owner === turn)
  const IsolatedWithAttachedNodes = getIsolatedNodes(attachedNodes, confirmedSelections.filter(obj => obj.owner !== turn && obj.owner !== 'none'))
  return IsolatedWithAttachedNodes.concat(turnNodes, neutralNodes)
}

const getIsolatedNodes = (attached: letterObject[], base: letterObject[]) => {
  const unAttached =  base.map(o => {
    if(!checkIfExistInSelection(attached, o)){
      o = {...o, owner: 'none'}
    }
    return o
  })
  return unAttached
}

const checkIfExistInSelection = (sel: letterObject[], o: letterObject) => {
  return sel.filter(s => s.row === o.row && s.column === o.column).length > 0
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

const getBestWord = (base: letterObject[], turn: string, max: number) => {
  const computerBase = base.filter(s => s.owner === turn)
  const opponentBase = base.filter(s => s.owner !== turn)
  let letterValueArray = [0, 0, 0, 0, 0] //word length,letters touching opponents base,letters touching own base,letters touching goal 5 higher than starting pos
  let greatestWordValue = 0
  let selection: letterObject[] = []
  for (const [i, letter] of computerBase.entries()) { 
    if(letter.hasOwnProperty('possibleWords') && letter.possibleWords.length){
      for (const [j, possibleWord] of computerBase[i].possibleWords.entries()){
        letterValueArray[0] = possibleWord.length //word length
        letterValueArray[1] = getCommonElements(opponentBase, possibleWord) * 2.5 //letters touching opp base
        letterValueArray[2] = getCommonElements(computerBase, possibleWord) * (-1) //letters touching own base
        letterValueArray[3] = checkIfWin(possibleWord, turn, max) ? 30 : 0 //if touching goal 20 points
        letterValueArray[4] = getChangeInHeight(possibleWord, turn) * 0.5 //change going upward/downward
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

const checkIfLetterSelectionIsallowed = (letter: letterObject, board: string[][], selected: letterObject[], turn: string) => {
  const selectedAgainIndex: number = selected.findIndex(l => l.row == letter.row && l.column == letter.column) 
  if (!selected.length){
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

export default {
  checkIfLetterSelectionIsallowed, 
  updateOwnersAndRemoveIsolatedNodes,
  checkIfWin, 
  getBestWord,
  updateBaseWithPossibleWordTable
}