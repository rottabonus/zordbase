export type letterObject = {
    letter: string
    row: number
    column: number,
    owner: string,
    possibleWords?: letterObject[][]
}

export type selectionObject = {
    possibleSelection: Boolean
    selectedBeforeIndex: number
}

export type playedWord = {
    word: string,
    owner: string
}

export interface GameBoardState {
      board: string[][],
      newGame: boolean,
      turn: string,
      isLoading: boolean
}

export interface BaseState {
      base: letterObject[],
      selection: letterObject[],
      playedWords: playedWord[],
      playerName: string,
      wholeBoard: letterObject[]
}

export interface PlayedWordState {
    playedWords: playedWord[]
}

export type LetterStyle = {
    backgroundColor: string
    class: string
    cursor: string
}

export type PlayerWordStyle = {
    color: string,
    textAlign: 'left' | 'right' | 'center'
}

export type ButtonVisibility = {
    visibility: 'visible' | 'hidden' | 'collapse',
    cursor: 'pointer' | 'auto'
}
