import React from 'react';
import { playedWord } from '../types/types'

interface PlayedWordProps {
    playedWords: playedWord[]
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {
 
    return <div>
                <ul>
                    {props.playedWords.map((w, i )=> (
                        w.owner === 'player1' ?
                         <li key={i} style={{color: "Cyan"}}>{w.word}</li>
                        :
                        <li key={i} style={{color: "Red"}}>{w.word}</li>
                    ))}
                </ul>
            </div>;
}
        
    



