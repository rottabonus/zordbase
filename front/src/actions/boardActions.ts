import wordService from '../services/words'

const createBoard = () => {
    return {
        type: "CREATEBOARD",
        payload: wordService.createBoard(8, 10)
    }
}

export default {
    createBoard
}