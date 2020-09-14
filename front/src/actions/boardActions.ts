const createBoard = () => {
    return {
        type: "CREATEBOARD",
        payload: createGameBoard(8, 10)
    }
}

const newGame = (newGame: boolean, turn: string) => {
    return {
        type: "NEWGAME",
        payload: {newGame, board: createGameBoard(8, 10), turn: turn}
    }
}

const gameStart = () => {
  return {
      type: "GAMESTART",
      payload: false
  }
}

const changeTurn = (turn: string) => {
    return {
        type: "CHANGETURN",
        payload: turn
    }
}

const createGameBoard = (rows: number, columns: number) => {
    const letters = 'aaaaabcdeeeeefghhhhiiiiijjjjkkkkllllmmnmnnnnooooopppprrrrssssttttuuuuuvvyööäääää'
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

export default {
    createBoard,
    newGame,
    changeTurn,
    createGameBoard,
    gameStart
}