import wordService from '../services/words'

const createBoard = () => {
    return {
        type: "CREATEBOARD",
        payload: wordService.createBoard(8, 10)
    }
}


const newGame = (newGame: boolean) => {
    return {
        type: "NEWGAME",
        payload: newGame
    }
}


const changeTurn = (turn: string) => {
    return {
        type: "CHANGETURN",
        payload: turn
    }
}

export default {
    createBoard,
    newGame,
    changeTurn
}