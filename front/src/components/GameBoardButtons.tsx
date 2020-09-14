import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'
import { ButtonVisibility } from '../types/types'

interface BoardButtonProps {
    confirmSelection: () => void
    removeSelection: () => void
    getButtonStyle: () => ButtonVisibility
    newGame: () => void
    resetGame: (board: string[][]) => void
}

export const GameBoardButtons: React.FC<BoardButtonProps> = (props) => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)

    return      <div className='gameboard-button-div'>
                    <div className='gameboard-button'>
                        <span><i className="fa fa-plus" onClick={() => props.newGame()}></i></span>
                        <span className='helptext'>New game</span>
                    </div>
                    <div className='gameboard-button'>
                        <span ><i className='fa fa-check' onClick={() => props.confirmSelection()} style={{visibility: props.getButtonStyle()}}></i></span>
                        <span className='helptext'>Confirm selection</span>
                    </div>
                    <div className='gameboard-button'>
                        <span><i className='fa fa-times' onClick={() => props.removeSelection()} style={{visibility: props.getButtonStyle()}}></i></span>
                        <span className='helptext'>Remove selection</span>
                    </div>
                    <div className='gameboard-button'>
                        <span><i className="fa fa-refresh" aria-hidden="true" onClick={() => props.resetGame(board)}></i></span>
                        <span className='helptext'>Reset game</span>
                    </div> 
                </div>
}
        
    



