import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
  
import { GameBoardPage } from './pages/BoardPage'
import { OtherComponent } from './components/OtherComponent'

export const App = () => {
     
    return (
        <Router>
            <div>
            <Link to={'/'}><button>Board</button></Link>
            <Link to={'/othercomponent'}><button>OtherComponent</button></Link>
            </div>
            <div>
                <Route exact path="/" render={() => <GameBoardPage />}/>
                <Route path="/othercomponent" render={() => <OtherComponent/>}/>
            </div>
        </Router>
    )
}

export default App