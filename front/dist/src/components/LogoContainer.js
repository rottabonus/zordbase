import React from 'react';
import logo from '../media/doggiedoo.png';
export var LogoContainer = function () {
    return (React.createElement("div", { className: "dog-container" },
        React.createElement("span", null,
            React.createElement("img", { className: 'dog-image', src: logo }))));
};
