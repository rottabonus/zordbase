import { letterObject, playedWord } from "../types/types"

const updateBase = (base: letterObject[]) => {
    return {
        type: "UPDATEBASE",
        payload: base
    }
}

const createBase = (base: letterObject[]) => {
    const possibleWordsTable: {[key:string]: string[]} = {}
    for (const [i, letter] of base.entries()){
        for (const [j, possibility] of letter.possibleWords.entries()) {
            const word = letter.letter + possibility.map(o => o.letter).join('')
            if(!(word in possibleWordsTable)){
                possibleWordsTable[word] = [`${letter.row},${letter.column}`]
            } else {
                possibleWordsTable[word].push(`${letter.row},${letter.column}`)
            }
        }
    }
    return {
        type: "CREATEBASE",
        payload: {base: base, possibleWordPositions: possibleWordsTable}
    }
}


const updateSelection = (selection: letterObject[]) => {
    return {
        type: "UPDATESELECTION",
        payload: selection
    }
}

const removeSelectionAndPlayedWords = (selection: letterObject[], played: playedWord[]) => {
    return {
        type: "REMOVESELECTIONANDPLAYED",
        payload: {selection: selection, played: played}
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

const changePlayerName = (playerName: string) => {
    return {
        type: "CHANGEPLAYERNAME",
        payload: playerName
    }
}

const resetBase = (base: letterObject[], max: number, playerName: string) => {
    const played: playedWord[] = []
    const selection: letterObject[] = []
    return {
        type: "RESETGAME",
        payload: {base: startingBase(base, max, playerName), played: played, selection: selection}
    }
}

const startingBase = (base: letterObject[], max: number, playerName: string) => {
    const startingBase = base.map(letter => {
        if(letter.row === 0){
            letter = {...letter, owner: playerName}
        } else if (letter.row === max-1){
            letter = {...letter, owner: 'computer'}
        } else {
            letter = {...letter, owner:'none'}
        }
        return letter
    })
    return startingBase
}



export default {
    updateBase,
    updateSelection,
    createBase,
    removeFromSelection,
    updatePlayedWords,
    confirmSelection,
    changePlayerName,
    resetBase,
    removeSelectionAndPlayedWords
}