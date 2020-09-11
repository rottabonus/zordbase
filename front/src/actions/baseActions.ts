import { letterObject, playedWord } from "../types/types"

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

const removeFromSelection = (index: number) => {
    return {
        type: "REMOVEFROMSELECTION",
        payload: index
    }
}

const updatePlayedWords = (played: playedWord[]) => {
    return {
        type: "UPDATEPLAYEDWORDS",
        payload: played
    }
}

const confirmSelection = (base: letterObject[], played: playedWord[], selection: letterObject[]) => {
    return {
        type: "CONFIRMSELECTION",
        payload: {base: base, played: played, selection: selection}
    }
}

export default {
    updateBase,
    updateSelection,
    createBase,
    removeFromSelection,
    updatePlayedWords,
    confirmSelection
}