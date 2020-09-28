import React from 'react';
import { playedWord } from '../types/types'
import { useSelector } from 'react-redux'
import { RootState } from '../reducers/combineReducer'


export const GameInfo: React.FC = () => {

    const played: playedWord[] = useSelector((state: RootState) => state.base.playedWords)

    const longestWord = played.map(p => p.word).reduce((acc, curr) => acc.length > curr.length ? acc : curr, '')

    return (
         <div className="game-info-container">
            {played.length ? <span>longest word: {longestWord}</span> : null}
        </div>
    )
}