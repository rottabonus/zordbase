import React from 'react';
import { playedWord } from '../types/types'

interface PlayedWordProps {
    playedWords: playedWord[]
    messagesEndRef: any
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {
 
    return <div className='wordListContainer' >
                {props.playedWords.map((w, i )=> (
                        w.owner === 'player1' ?
                        <span key={i} style={{color: "Cyan"}}>{w.word}</span>
                        :
                        <span key={i} style={{color: "Red"}}>{w.word}</span>
                    ))}
                    <div ref={props.messagesEndRef} />
                </div>
                
}
        
    



