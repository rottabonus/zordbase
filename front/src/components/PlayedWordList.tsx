import React, { useRef, useEffect } from 'react';
import { playedWord, PlayerWordStyle, letterObject } from '../types/types'
import { BalanceOfPower } from './BalanceOfPower'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'
import { useWindowSize } from '../hooks/windowSize'

interface PlayedWordProps {
    timeTravel: (turn: number) => void
}

export const PlayedWordList: React.FC<PlayedWordProps> = (props) => {

    const played: playedWord[] = useSelector((state: RootState) => state.base.playedWords)
    const playerName: string = useSelector((state: RootState) => state.base.playerName)
    const base: letterObject[] = useSelector((state: RootState) => state.base.base)
    const isLoading: boolean = useSelector((state: RootState) => state.board.isLoading)

    const playerNodes = base.filter(f => f.owner === playerName).length
    const comNodes = base.filter(f => f.owner === 'computer').length
    const percentageDifference = isLoading ? 50 : ((playerNodes - comNodes) / (playerNodes + comNodes / 2) * 100) + 50

    const messagesEndRef = useRef(null)
    const size = useWindowSize()

    const getWordStyle = (owner: string): PlayerWordStyle => {
        return owner === 'computer' ? {color: 'khaki', textAlign: 'right'} : {color: '#87b6b8', textAlign: 'left'} 
    }

    const scrollToBottom = () => {
        if(size.width > 550 ){
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }

    useEffect(() => {
        scrollToBottom()
      }, [played])
 
    return <div className='wordListContainer' >
           <BalanceOfPower playerPercentage={percentageDifference} playerName={playerName} />
            <div className='wordListWords'>
                {played.map((w, i )=> {
                    const styleValues = getWordStyle(w.owner)
                    return (<span key={i} onClick={() => props.timeTravel(w.turn)} style={{color: styleValues.color, textAlign: styleValues.textAlign, cursor: 'pointer', padding:'4px'}}>{w.word}</span>)
                }                    
                )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
                
}
        
    



