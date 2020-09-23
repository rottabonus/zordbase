/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

addEventListener('message', (event) => {
    //console.log('postmessage event')
    const wholeBoard = calculateValues(event.data.board, event.data.playerName, event.data.words)
  postMessage(wholeBoard);
});


const calculateValues = (board, playerName, allWords) => {
  let base = []
  for(const [j, boardRow] of board.entries()){
    const owner = j === 0 ? playerName :  j === board.length-1 ? 'computer' : 'none'
    const row = boardRow.map((letter, column) => ({'letter': letter, 'row': j, 'column': column, 'owner': owner}))
    base.push(...row)
  }
  const mappedWithPossibilities = base.map(letter => {
    letter = {...letter, possibleWords: checkAllPossibleWordsAndRoutes(letter, board, allWords)}
    return letter
  })
  return mappedWithPossibilities
}

const checkAllPossibleWordsAndRoutes = (letter, board, all) => {
  const movements = generateMovements(board)
  const possibilities = []
  const allWords = all.filter(w => w.toUpperCase().startsWith(letter.letter))
  const words = allWords.map((w) => w.toUpperCase())
  words.forEach( (possibleWord) => {
    const route = getRouteForWord(possibleWord, movements, letter)
    if (route.length > 0) {
      possibilities.push(route.filter((w, i) => i !== 0))
    }
  })
  return possibilities
}

const getRouteForWord = (wordStr, movements, obj) => {
  const queue = [...movements[getKeyNameObject(obj)]]
  const searched = [obj]
  const selection = [obj]
  let curPos = [obj.row, obj.column]
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

const returnNonPathSearchedNodeIndexes = (searched, obj, allMoves, selection, wordStr) => {
  const objectMoves = allMoves[`${obj.row},${obj.column}`]
  const toReturnIndexes = []
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

const generateMovements = (board) => {
  const moves = {}
  board.forEach((row, r) => {
      row.forEach((column, c) => {
          moves[`${r},${c}`] = getNeighborsData({'letter': board[r][c], 'row': r, 'column': c, 'owner': 'none'}, board)
      })
  })
  return moves
}

const getKeyNameObject = (obj) => {
  return `${obj.row},${obj.column}`
}

const getNeighborsData = (node, board) => {
  const possibleMoves = []
  const possibleXpositions = [node.row, node.row + 1, node.row - 1].filter(x => x >= 0 && x < board.length)
  const possibleYpositions = [node.column, node.column + 1, node.column - 1].filter(x => x >= 0 && x < (board[0].length)) 
  possibleXpositions.forEach( (xPos) => {
        possibleYpositions.forEach( (yPos) => {
        if(!(xPos === node.row && yPos === node.column)){
          possibleMoves.push({'row':xPos, 'column':yPos, 'letter':board[xPos][yPos], 'owner': 'none'})
        }
      })
    })
  return possibleMoves
}

const checkPosition = (r, c, arr) => {
  return (r-1 === arr[0] || r === arr[0] || r+1 ===arr[0]) && (c-1 === arr[1] || c ===arr[1] || c+1 === arr[1]) && !(r === arr[0] && c === arr[1])
}

/***/ })
/******/ ]);