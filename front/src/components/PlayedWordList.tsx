import React, { useRef, useEffect } from 'react';
import { playedWord, PlayerWordStyle } from '../types/types'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'

interface PlayedWordProps {
    timeTravel: (turn: number) => void
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {

    const played: playedWord[] = useSelector((state: RootState) => state.base.playedWords)
    const playerName: string = useSelector((state: RootState) => state.base.playerName)
    const messagesEndRef = useRef(null)

    const getWordStyle = (owner: string): PlayerWordStyle => {
        return owner === 'computer' ? {color: 'lightsalmon', textAlign: 'right'} : {color: 'paleturquoise', textAlign: 'left'} 
    }

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
      }, [played])
 
    return <div className='wordListContainer' >
        <div className='wordListHeader'>
            <div>{playerName}</div>
            <div>computer</div>
        </div>
            <div className='wordListWords'>
                {played.map((w, i )=> {
                    const styleValues = getWordStyle(w.owner)
                    return (<span key={i} onClick={() => props.timeTravel(w.turn)} style={{color: styleValues.color, textAlign: styleValues.textAlign, cursor: 'pointer'}}>{w.word}</span>)
                }                    
                )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
                
}
        
    



