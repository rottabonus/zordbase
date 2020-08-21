import React from 'react';
import { letterObject } from '../types/types';

interface BoardProps {
    letters: string[][];
    selectLetter: (L: string, row: number, column: number) => void;
    getSelected: (R: number, C: number, LO: letterObject[]) => Boolean;
    selected: letterObject[]
}

export const Board: React.FC<BoardProps> = (props) => {
 
    return <div>
               <table>
                   <tbody>
                        {props.letters.map((row, i) => (
                        <tr key={i}>
                            { row.map((cellId, j) => (props.getSelected(i, j, props.selected)) ?
                                <td style={{backgroundColor: "Cyan"}} key={j} onClick={(event) => props.selectLetter(cellId, i, j)}>{cellId}</td>
                                :
                                <td key={j} onClick={(event) => props.selectLetter(cellId, i, j)}>{cellId}</td>
                                )}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>;
}
        
    



