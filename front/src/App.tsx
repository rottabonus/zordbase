import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './index.css'
  
import { GameBoardPage } from './pages/BoardPage'
import { OtherComponent } from './components/OtherComponent'

export const App: React.FC = () => {
     
    return (
        <Router>
            <div className='topnav'>
            <Link to={'/'}><a>Play</a></Link>
            <Link to={'/othercomponent'}><a>How to</a></Link>
            </div>
            <div>
                <Route exact path="/" render={() => <GameBoardPage />}/>
                <Route path="/othercomponent" render={() => <OtherComponent/>}/>
            </div>
        </Router>
    )
}

export default App

