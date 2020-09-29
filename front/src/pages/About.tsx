import React from 'react'

export const About: React.FC = () => {
  return(
  <div className='about-page-container'>
    <div className='about-header'>
      <h2>ZordBase</h2>
    </div>
    <div className='about-paragraph'>
      <p>I have created this game inspired by <a href='https://apkpure.com/wordbase-%E2%80%93-fun-word-search-battles-with-friends/com.wordbaseapp' style={{color:'khaki'}}>WordBase</a>, which was a great multiplayer-android game (really!), and sadly shut down due to unprofitability.<br></br>
      <br></br>
        My motivations for creating this game has been learning. :)<br></br>
        I got the idea when a buddy of mine showed a <a href='https://github.com/pheis/riti-rati' style={{color: '#87b6b8'}}>neat scrabble solver script</a> he wrote to help in games against his girlfriend.<br></br>
        I thought the script was pretty elegant, and I wanted to see if I could create a WordBase solver myself. 
        In the creating process I decided that instead of a solver, I would make a singleplayer-game to play against a computer instead.<br></br>
        </p>
        <p>The <a href='http://kaino.kotus.fi/sanat/nykysuomi/' style={{color: '#87b6b8'}}>Finnish wordlist</a> used to evaluate played words, is from the <a href='https://www.kotus.fi/en' style={{color: 'khaki'}}>Institute for the Languages of Finland.</a></p>
        <p>The source code can be found from my <a href='https://github.com/rottabonus/zordbase' style={{color: '#87b6b8'}}>github page.</a><br></br></p>
    </div>
    <div className='about-tail'>
      <p>Felix Hallenberg</p></div>
  </div>
)
}
