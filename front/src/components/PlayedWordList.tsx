import React from 'react';
import { playedWord } from '../types/types'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface PlayedWordProps {
    messagesEndRef: any
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {

    const played: playedWord[] = useSelector((state: RootState) => state.base.playedWords)
 
    return <div className='wordListContainer' >
                {played.map((w, i )=> (
                        w.owner === 'player1' ?
                        <span key={i} style={{color: "Cyan"}}>{w.word}</span>
                        :
                        <span key={i} style={{color: "Red"}}>{w.word}</span>
                    ))}
                    <div ref={props.messagesEndRef} />
                </div>
                
}
        
    



