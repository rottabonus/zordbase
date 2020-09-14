import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware  } from 'redux'
import rootReducer from './reducers/combineReducer'
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)))

import App from './App';


ReactDOM.render(<Provider store={store}><App /></Provider>, document.querySelector('#root'));