import React from 'react';

export const Board = (props: any) => {
 
    return <div>
               <table>
                   <tbody>
                        {props.letters.map((row: any[], i:any) => (
                        <tr key={i}>
                            {row.map((cellId: React.ReactNode, j:any) => <td key={j}>{cellId}</td>)}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>;
}
        
    



