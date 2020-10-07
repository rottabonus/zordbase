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

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function F() {};

      return {
        s: F,
        n: function n() {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function e(_e2) {
          throw _e2;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function s() {
      it = o[Symbol.iterator]();
    },
    n: function n() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function e(_e3) {
      didErr = true;
      err = _e3;
    },
    f: function f() {
      try {
        if (!normalCompletion && it["return"] != null) it["return"]();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

addEventListener('message', function (event) {
  //console.log('postmessage event')
  var wholeBoard = calculateValues(event.data.board, event.data.playerName, event.data.words);
  postMessage(wholeBoard);
});

var calculateValues = function calculateValues(board, playerName, allWords) {
  var base = [];

  var _iterator = _createForOfIteratorHelper(board.entries()),
      _step;

  try {
    var _loop = function _loop() {
      var _step$value = _slicedToArray(_step.value, 2),
          j = _step$value[0],
          boardRow = _step$value[1];

      var owner = j === 0 ? playerName : j === board.length - 1 ? 'computer' : 'none';
      var row = boardRow.map(function (letter, column) {
        return {
          'letter': letter,
          'row': j,
          'column': column,
          'owner': owner
        };
      });
      base.push.apply(base, _toConsumableArray(row));
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      _loop();
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  var mappedWithPossibilities = base.map(function (letter) {
    letter = _objectSpread(_objectSpread({}, letter), {}, {
      possibleWords: checkAllPossibleWordsAndRoutes(letter, board, allWords)
    });
    return letter;
  });
  return mappedWithPossibilities;
};

var checkAllPossibleWordsAndRoutes = function checkAllPossibleWordsAndRoutes(letter, board, all) {
  var movements = generateMovements(board);
  var possibilities = [];
  var allWords = all.filter(function (w) {
    return w.toUpperCase().startsWith(letter.letter);
  });
  var words = allWords.map(function (w) {
    return w.toUpperCase();
  });
  words.forEach(function (possibleWord) {
    var route = getRouteForWord(possibleWord, movements, letter);

    if (route.length > 0) {
      possibilities.push(route.filter(function (w, i) {
        return i !== 0;
      }));
    }
  });
  return possibilities;
};

var getRouteForWord = function getRouteForWord(wordStr, movements, obj) {
  var queue = _toConsumableArray(movements[getKeyNameObject(obj)]);

  var searched = [obj];
  var selection = [obj];
  var curPos = [obj.row, obj.column];

  var _loop2 = function _loop2() {
    var toCheck = queue.shift();
    var curWord = selection.map(function (s) {
      return s.letter;
    }).join('');

    if (searched.findIndex(function (l) {
      return l.row === toCheck.row && l.column === toCheck.column;
    }) === -1) {
      if (wordStr.includes(curWord + toCheck.letter) && checkPosition(toCheck.row, toCheck.column, curPos)) {
        selection.push(toCheck);
        curPos = [toCheck.row, toCheck.column];
        queue.push.apply(queue, _toConsumableArray(movements["".concat(toCheck.row, ",").concat(toCheck.column)]));

        if (wordStr === curWord + toCheck.letter) {
          return {
            v: selection
          };
        }

        var reSearchable = returnNonPathSearchedNodeIndexes(searched, toCheck, movements, selection, wordStr);
        reSearchable.forEach(function (nodeIndex) {
          searched.splice(nodeIndex, 1);
          var returned = searched.splice(nodeIndex, 1);
          queue.unshift.apply(queue, _toConsumableArray(returned));
        });
      }
    }

    searched.push(toCheck);
  };

  do {
    var _ret = _loop2();

    if (_typeof(_ret) === "object") return _ret.v;
  } while (queue.length > 0);

  return [];
};

var returnNonPathSearchedNodeIndexes = function returnNonPathSearchedNodeIndexes(searched, obj, allMoves, selection, wordStr) {
  var objectMoves = allMoves["".concat(obj.row, ",").concat(obj.column)];
  var toReturnIndexes = [];
  objectMoves.forEach(function (move) {
    searched.forEach(function (pos, i) {
      if (JSON.stringify(pos) === JSON.stringify(move)) {
        if (selection.findIndex(function (l) {
          return l.row === pos.row && l.column === pos.column;
        }) === -1 && wordStr.startsWith(selection.map(function (s) {
          return s.letter;
        }).join('') + pos.letter)) {
          toReturnIndexes.push(i);
        }
      }
    });
  });
  return toReturnIndexes;
};

var generateMovements = function generateMovements(board) {
  var moves = {};
  board.forEach(function (row, r) {
    row.forEach(function (column, c) {
      moves["".concat(r, ",").concat(c)] = getNeighborsData({
        'letter': board[r][c],
        'row': r,
        'column': c,
        'owner': 'none'
      }, board);
    });
  });
  return moves;
};

var getKeyNameObject = function getKeyNameObject(obj) {
  return "".concat(obj.row, ",").concat(obj.column);
};

var getNeighborsData = function getNeighborsData(node, board) {
  var possibleMoves = [];
  var possibleXpositions = [node.row, node.row + 1, node.row - 1].filter(function (x) {
    return x >= 0 && x < board.length;
  });
  var possibleYpositions = [node.column, node.column + 1, node.column - 1].filter(function (x) {
    return x >= 0 && x < board[0].length;
  });
  possibleXpositions.forEach(function (xPos) {
    possibleYpositions.forEach(function (yPos) {
      if (!(xPos === node.row && yPos === node.column)) {
        possibleMoves.push({
          'row': xPos,
          'column': yPos,
          'letter': board[xPos][yPos],
          'owner': 'none'
        });
      }
    });
  });
  return possibleMoves;
};

var checkPosition = function checkPosition(r, c, arr) {
  return (r - 1 === arr[0] || r === arr[0] || r + 1 === arr[0]) && (c - 1 === arr[1] || c === arr[1] || c + 1 === arr[1]) && !(r === arr[0] && c === arr[1]);
};

/***/ })
/******/ ]);