import React from 'react';
import { playedWord, PlayerWordStyle } from '../types/types'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface PlayedWordProps {
    messagesEndRef: any
    getWordStyle: (owner: string) => PlayerWordStyle
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {

    const played: playedWord[] = useSelector((state: RootState) => state.base.playedWords)
    const playerName: string = useSelector((state: RootState) => state.base.playerName)
 
    return <div className='wordListContainer' >
        <div className='wordListHeader'>
            <div>{playerName}</div>
            <div>computer</div>
        </div>
            <div className='wordListWords'>
                {played.map((w, i )=> {
                    const styleValues = props.getWordStyle(w.owner)
                    return (<span key={i} style={{color: styleValues.color, textAlign: styleValues.textAlign}}>{w.word}</span>)
                }                    
                )}
                    <div ref={props.messagesEndRef} />
                </div>
            </div>
                
}
        
    



