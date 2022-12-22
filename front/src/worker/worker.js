addEventListener("message", (event) => {
  //console.log('postmessage event')
  const wholeBoard = calculateValues(
    event.data.board,
    event.data.playerName,
    event.data.words
  );
  postMessage(wholeBoard);
});

const calculateValues = (board, playerName, allWords) => {
  let base = [];
  for (const [j, boardRow] of board.entries()) {
    const owner =
      j === 0 ? playerName : j === board.length - 1 ? "computer" : "none";
    const row = boardRow.map((letter, column) => ({
      letter: letter,
      row: j,
      column: column,
      owner: owner,
    }));
    base.push(...row);
  }
  const mappedWithPossibilities = base.map((letter) => {
    letter = {
      ...letter,
      possibleWords: checkAllPossibleWordsAndRoutes(letter, board, allWords),
    };
    return letter;
  });
  return mappedWithPossibilities;
};

const checkAllPossibleWordsAndRoutes = (letter, board, all) => {
  const movements = generateMovements(board);
  const possibilities = [];
  const allWords = all.filter((w) => w.toUpperCase().startsWith(letter.letter));
  const words = allWords.map((w) => w.toUpperCase());
  words.forEach((possibleWord) => {
    const route = getRouteForWord(possibleWord, movements, letter);
    if (route.length > 0) {
      possibilities.push(route.filter((_w, i) => i !== 0));
    }
  });
  return possibilities;
};

const getRouteForWord = (wordStr, movements, obj) => {
  const queue = [...movements[getKeyNameObject(obj)]];
  const searched = [obj];
  const selection = [obj];
  let curPos = [obj.row, obj.column];
  do {
    const toCheck = queue.shift();
    const curWord = selection.map((s) => s.letter).join("");
    if (
      searched.findIndex(
        (l) => l.row === toCheck.row && l.column === toCheck.column
      ) === -1
    ) {
      if (
        wordStr.includes(curWord + toCheck.letter) &&
        checkPosition(toCheck.row, toCheck.column, curPos)
      ) {
        selection.push(toCheck);
        curPos = [toCheck.row, toCheck.column];
        queue.push(...movements[`${toCheck.row},${toCheck.column}`]);
        if (wordStr === curWord + toCheck.letter) {
          return selection;
        }
        const reSearchable = returnNonPathSearchedNodeIndexes(
          searched,
          toCheck,
          movements,
          selection,
          wordStr
        );
        reSearchable.forEach((nodeIndex) => {
          searched.splice(nodeIndex, 1);
          const returned = searched.splice(nodeIndex, 1);
          queue.unshift(...returned);
        });
      }
    }
    searched.push(toCheck);
  } while (queue.length > 0);
  return [];
};

const returnNonPathSearchedNodeIndexes = (
  searched,
  obj,
  allMoves,
  selection,
  wordStr
) => {
  const objectMoves = allMoves[`${obj.row},${obj.column}`];
  const toReturnIndexes = [];
  objectMoves.forEach((move) => {
    searched.forEach((pos, i) => {
      if (JSON.stringify(pos) === JSON.stringify(move)) {
        if (
          selection.findIndex(
            (l) => l.row === pos.row && l.column === pos.column
          ) === -1 &&
          wordStr.startsWith(
            selection.map((s) => s.letter).join("") + pos.letter
          )
        ) {
          toReturnIndexes.push(i);
        }
      }
    });
  });
  return toReturnIndexes;
};

const generateMovements = (board) => {
  const moves = {};
  board.forEach((row, r) => {
    row.forEach((_column, c) => {
      moves[`${r},${c}`] = getNeighborsData(
        { letter: board[r][c], row: r, column: c, owner: "none" },
        board
      );
    });
  });
  return moves;
};

const getKeyNameObject = (obj) => {
  return `${obj.row},${obj.column}`;
};

const getNeighborsData = (node, board) => {
  const possibleMoves = [];
  const possibleXpositions = [node.row, node.row + 1, node.row - 1].filter(
    (x) => x >= 0 && x < board.length
  );
  const possibleYpositions = [
    node.column,
    node.column + 1,
    node.column - 1,
  ].filter((x) => x >= 0 && x < board[0].length);
  possibleXpositions.forEach((xPos) => {
    possibleYpositions.forEach((yPos) => {
      if (!(xPos === node.row && yPos === node.column)) {
        possibleMoves.push({
          row: xPos,
          column: yPos,
          letter: board[xPos][yPos],
          owner: "none",
        });
      }
    });
  });
  return possibleMoves;
};

const checkPosition = (r, c, arr) => {
  return (
    (r - 1 === arr[0] || r === arr[0] || r + 1 === arr[0]) &&
    (c - 1 === arr[1] || c === arr[1] || c + 1 === arr[1]) &&
    !(r === arr[0] && c === arr[1])
  );
};
