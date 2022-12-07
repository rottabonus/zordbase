import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './css/index.css';
import { GameBoardPage } from './pages/BoardPage';
import { Howto } from './pages/Howto';
import { About } from './pages/About';
export var App = function () {
    return (React.createElement(Router, null,
        React.createElement("div", { className: 'topnav' },
            React.createElement(Link, { to: '/' },
                React.createElement("span", null, "Play")),
            React.createElement(Link, { to: '/howto' },
                React.createElement("span", null, "How to")),
            React.createElement(Link, { to: '/about' },
                React.createElement("span", null, "About"))),
        React.createElement("div", null,
            React.createElement(Route, { exact: true, path: "/", render: function () { return React.createElement(GameBoardPage, null); } }),
            React.createElement(Route, { path: "/howto", render: function () { return React.createElement(Howto, null); } }),
            React.createElement(Route, { path: "/about", render: function () { return React.createElement(About, null); } }))));
};
export default App;
