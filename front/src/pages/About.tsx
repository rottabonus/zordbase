import React from 'react'

export const About: React.FC = () => {
  return(
  <div className='about-page-container'>
    <div className='about-header'>
      <h2>ZordBase</h2>
    </div>
    <div className='about-paragraph'>
      <p>I have created this game inspired by <a href="https://apkpure.com/wordbase-%E2%80%93-fun-word-search-battles-with-friends/com.wordbaseapp">WordBase</a>, which was a great multiplayer-android game (really!), and sadly shut down due to unprofitability.<br></br>
        My motivations for creating this game has been learning. :)<br></br>
        I got the idea when my friend showed a neat scrabble solver script he wrote to help in games against his girlfriend.<br></br>
        I thought the script was pretty elegant, and I wanted to see if I could create a WordBase solver myself. 
        Ofcourse, I made a lot of spaghetti, but creating the app was fun. In the process I decided that instead of a solver, I would create a singleplayer-game to play against computer<br></br>
        </p>
        <p>The source code can be found from my <a href="https://github.com/rottabonus/zordbase">github page.</a><br></br></p>
    </div>
    <div className='about-tail'>
      <p>Felix Hallenberg aka rottabonus</p></div>
  </div>
)
}
