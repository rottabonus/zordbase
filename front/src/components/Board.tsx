import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface BoardProps {
    selectLetter: (L: string, row: number, column: number, owner: string) => void
    getSelected: (R: number, C: number, type: string) => string
    confirmSelection: () => void
}

export const Board: React.FC<BoardProps> = (props) => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)

    return <div>
               <table>
                   <tbody>
                        {board.map((row, i) => (   
                        <tr key={i}>
                            { row.map((cellId, j) => (props.getSelected(i, j, 'owner')) === 'player1' ?
                                <td className={props.getSelected(i, j, 'class')} style={{backgroundColor: 'Cyan'}} key={j} onClick={(event) => props.selectLetter(cellId, i, j, 'player1')}>{cellId}</td>
                                :  
                                (props.getSelected(i, j, 'owner')) === 'player2' ?
                                <td  className={props.getSelected(i, j, 'class')} style={{backgroundColor: 'Red'}} key={j} onClick={(event) => props.selectLetter(cellId, i, j, 'player2')}>{cellId}</td>
                                :
                                <td className={props.getSelected(i, j, 'class')} key={j} onClick={(event) => props.selectLetter(cellId, i, j, 'none')}>{cellId}</td>
                                )}
                        </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => props.confirmSelection()}>Confirm selection</button>
            </div>
}
        
    



