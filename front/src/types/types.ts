export type letterObject = {
    letter: string
    row: number
    column: number,
    owner: string,
    possibleWords: letterObject[][]
}

export type wordObject = {
    letters: string
    pos: string
}

export type selectionObject = {
    possibleSelection: Boolean
    selectedBeforeIndex: number
}

export type playedWord = {
    word: string,
    owner: string
}

