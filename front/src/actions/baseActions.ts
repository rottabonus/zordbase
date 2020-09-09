import { letterObject } from "../types/types"

const updateBase = (base: letterObject[]) => {
    return {
        type: "UPDATEBASE",
        payload: base
    }
}

const createBase = (board: string[][]) => {
    const playerOneBase = board[0].map( (letter, column) => ({'letter': letter, 'row': 0, 'column': column, 'owner': 'player1'}))
    const playerTwoBase = board[board.length-1].map( (letter, column) => ({'letter': letter, 'row': board.length-1, 'column': column, 'owner': 'player2'}))
    return {
        type: "UPDATEBASE",
        payload: playerOneBase.concat(playerTwoBase)
    }
}

const updateSelection = (selection: letterObject[]) => {
    return {
        type: "UPDATESELECTION",
        payload: selection
    }
}

export default {
    updateBase,
    updateSelection,
    createBase
}