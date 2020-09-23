import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface BoardHeaderProps {

}

export const GameBoardHeader: React.FC<BoardHeaderProps> = (props) => {

    const turn: string = useSelector((state: RootState) => state.board.turn)
    const isLoading: boolean = useSelector((state: RootState) => state.board.isLoading)

    const headerMessage = turn.endsWith('s') ? `${turn}'s turn` : `${turn}s turn`

    return      <div className='gameboard-header'>
                    {isLoading ? <span>Generating Board</span> : <span>{headerMessage}</span>}
                </div>
}
        
    



