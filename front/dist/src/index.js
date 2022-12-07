import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers/combineReducer';
import { composeWithDevTools } from 'redux-devtools-extension';
var store = createStore(rootReducer, composeWithDevTools());
import App from './App';
ReactDOM.render(React.createElement(Provider, { store: store },
    React.createElement(App, null)), document.querySelector('#root'));
