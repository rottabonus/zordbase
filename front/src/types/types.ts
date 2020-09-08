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

export interface CounterState {
    counter: number
  }

  export interface GameBoardState {
      board: string[][]
  }

  export interface BaseState {
      base: letterObject[]
  }
