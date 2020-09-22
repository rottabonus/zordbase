import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'
import { ButtonVisibility, letterObject } from '../types/types'

interface BoardButtonProps {
    confirmSelection: () => void
    removeSelection: () => void
    newGame: () => void
    resetGame: (board: string[][]) => void
}

export const GameBoardButtons: React.FC<BoardButtonProps> = (props) => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)
    const selected: letterObject[] = useSelector((state: RootState) => state.base.selection)
    
    const getButtonStyle = (): ButtonVisibility => {
        return selected.length ? {visibility: 'visible', cursor: 'pointer' } : {visibility: 'hidden', cursor: 'auto' }
    }

    const buttonStyles: ButtonVisibility = getButtonStyle()

    return      <div className='gameboard-button-div'>
                    <div className='gameboard-button'>
                        <span><i className="fa fa-plus" onClick={() => props.newGame()} style={{cursor: 'pointer'}}></i></span>
                        <span className='helptext'>New game</span>
                    </div>
                    <div className='gameboard-button'>
                        <span ><i className='fa fa-check' onClick={() => props.confirmSelection()} style={{visibility: buttonStyles.visibility, cursor: buttonStyles.cursor}}></i></span>
                        {selected.length ? <span className='helptext'>Confirm selection</span> : null}
                    </div>
                    <div className='gameboard-button'>
                        <span><i className='fa fa-times' onClick={() => props.removeSelection()} style={{visibility: buttonStyles.visibility, cursor: buttonStyles.cursor}}></i></span>
                        {selected.length ? <span className='helptext'>Remove selection</span> : null}
                    </div>
                    <div className='gameboard-button'>
                        <span><i className="fa fa-refresh" aria-hidden="true" onClick={() => props.resetGame(board)} style={{cursor: 'pointer'}}></i></span>
                        <span className='helptext'>Reset game</span>
                    </div> 
                </div>
}
        
    



