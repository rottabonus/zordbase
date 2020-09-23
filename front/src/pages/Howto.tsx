import React from 'react'

export const Howto: React.FC = () => {
  return(
  <div className='howto-page-container'>
    <div className='howto-header'>
      <h2>How to play</h2>
    </div>
  <div className='howto-paragraph'>
      <p>The goal is to reach the opponents base by playing words.<br></br>
        Words are created by selecting letters one by one.<br></br>
        Letter selection must start from your own base, and only the neighboring node can be selected. However you can move in any direction.<br></br>
        Bases are highlighted by colors. Player starts from top and computer from bottom<br></br>
        When you are happy with your selection, you may confirm the selection from the confirm-button, on the bottom of the board.<br></br>
        Every time a word is played, your base is expanded. <br></br>
        All nodes that are not connected to your base, are cut off. This way you may block your opponents advances. <br></br>
        The words must be in the basic form and at the moment only Finnish wordlist is found in the game.<br></br></p>
       <p>Have fun!</p>
    </div>
  </div>
)
}
