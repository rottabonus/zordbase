import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'
import { LetterStyle } from '../types/types'

interface BoardProps {
    selectLetter: (L: string, row: number, column: number, owner: string) => void
    getLetterStyle: (R: number, C: number) => LetterStyle
}

export const Board: React.FC<BoardProps> = (props) => {

    const board: string[][] = useSelector((state: RootState) => state.board.board)
    const playerName: string = useSelector((state: RootState) => state.base.playerName)

    return <div>
               <table>
                   <tbody>
                        {board.map((row, i) => (   
                        <tr key={i}>
                            { row.map((cellId, j) => {
                                 const styleValues = props.getLetterStyle(i, j)
                                 return (<td  className={styleValues.class} style={{backgroundColor: styleValues.backgroundColor, cursor: styleValues.cursor}} key={j} onClick={() => props.selectLetter(cellId, i, j, playerName)}>{cellId}</td>)        
                                }
                            )}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
}
        
    



