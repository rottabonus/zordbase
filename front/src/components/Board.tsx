import React from 'react';

interface BoardProps {
    letters: string[][];
    selectLetter: (L: string, row: number, column: number, owner: string) => void;
    getSelected: (R: number, C: number) => string;
    confirmSelection: () => void;
}

export const Board: React.FC<BoardProps> = (props) => {
 
    return <div>
               <table>
                   <tbody>
                        {props.letters.map((row, i) => (
                        <tr key={i}>
                            { row.map((cellId, j) => (props.getSelected(i, j)) === 'player1' ?
                                <td style={{backgroundColor: "Cyan"}} key={j} onClick={(event) => props.selectLetter(cellId, i, j, 'player1')}>{cellId}</td>
                                :  
                                (props.getSelected(i, j)) === 'player2' ?
                                <td style={{backgroundColor: "Red"}} key={j} onClick={(event) => props.selectLetter(cellId, i, j, 'player2')}>{cellId}</td>
                                :
                                <td key={j} onClick={(event) => props.selectLetter(cellId, i, j, 'none')}>{cellId}</td>
                                )}
                        </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={() => props.confirmSelection()}>Confirm selection</button>
            </div>;
}
        
    



