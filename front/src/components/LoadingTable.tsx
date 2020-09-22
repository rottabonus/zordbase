import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface BoardProps {
}

export const LoadingTable: React.FC<BoardProps> = (props) => {

    const loadingBoard: string[][] = [
        ["L","O","A","D","I","N","G",".",".","."],
        ["C","R","E","A","T","I","N","G",".","."],
        ["C","A","L","C","U","L","A","T","I","N"],
        ["F","I","N","A","L","I","Z","I","N","G"],
        ["V","O","C","A","L","I","Z","I","N","G"],
        ["M","E","Z","M","E","R","I","Z","I","N"],
        ["A","D","V","I","C","I","N","G",".","."],
        ["H","A","R","M","O","N","I","Z","I","N"],
        ["B","U","I","L","D","I","N","G",".","."],
        ["F","O","R","M","A","T","I","Z","I","N"],
        ["B","A","M","B","O","O","Z","L","I","N"],
        ["G","E","T"," ","R","E","A","D","Y","."]]


    return <div>
               <table>
                   <tbody>
                        {loadingBoard.map((row, i) => (   
                        <tr key={i}>
                            { row.map((cellId, j) => {	
                                return (<td key={j} className='spin' >{cellId}</td>)
                            }      
                            )}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
}
        
    



