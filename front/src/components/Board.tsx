import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface BoardProps {
    selectLetter: (L: string, row: number, column: number, owner: string) => void
    getSelectedClass: (R: number, C: number, type: string) => string
    confirmSelection: () => void
    removeSelection: () => void
    getCursorStyle: () => string
}

export const Board: React.FC<BoardProps> = (props) => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)

    return <div className='GameBoard'>
               <table>
                   <tbody>
                        {board.map((row, i) => (   
                        <tr key={i}>
                            { row.map((cellId, j) => (props.getSelectedClass(i, j, 'owner')) === 'player1' ?
                                <td className={props.getSelectedClass(i, j, 'class')} style={{cursor: props.getCursorStyle(), backgroundColor: 'paleturquoise'}} key={j} onClick={() => props.selectLetter(cellId, i, j, 'player1')}>{cellId}</td>
                                :  
                                (props.getSelectedClass(i, j, 'owner')) === 'player2' ?
                                <td  className={props.getSelectedClass(i, j, 'class')} style={{cursor: props.getCursorStyle(), backgroundColor: 'lightsalmon'}} key={j} onClick={() => props.selectLetter(cellId, i, j, 'player2')}>{cellId}</td>
                                :
                                <td className={props.getSelectedClass(i, j, 'class')} style={{cursor: props.getCursorStyle()}}  key={j} onClick={() => props.selectLetter(cellId, i, j, 'none')}>{cellId}</td>
                                )}
                        </tr>
                        ))}
                    </tbody>
                </table>
                <div className='gameboard-button-div'>
                    <span className='gameboard-button'><i className='fa fa-check' onClick={() => props.confirmSelection()}></i></span>
                    <span className='gameboard-button'><i className='fa fa-times' onClick={() => props.removeSelection()}></i></span>
                </div>
            </div>
}
        
    



