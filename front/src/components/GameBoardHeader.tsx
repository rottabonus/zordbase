import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'
import { letterObject } from '../types/types'

export const GameBoardHeader: React.FC = () => {

    const turn: string = useSelector((state: RootState) => state.board.turn)
    const isLoading: boolean = useSelector((state: RootState) => state.board.isLoading)
    const selected: letterObject[] = useSelector((state: RootState) => state.base.selection)

    const headerMessage = turn.endsWith('s') ? `${turn}'s turn` : `${turn}s turn`

    return      <div className='gameboard-header'>
                    {isLoading ? <span>Generating Board</span> : selected.length ? <span>{selected.map(s => s.letter).join('')}</span> : <span>{headerMessage}</span>}
                </div>
}
        
    



