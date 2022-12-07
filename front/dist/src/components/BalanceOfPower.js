import React from 'react';
export var BalanceOfPower = function (props) {
    var fillerStyles = {
        height: '100%',
        width: props.playerPercentage + "%",
        backgroundColor: '#87b6b8',
        borderRadius: 'inherit'
    };
    return (React.createElement("div", { className: 'balanceBar' },
        React.createElement("div", { style: fillerStyles },
            React.createElement("span", { className: 'playerLabel' }, props.playerName),
            React.createElement("span", { className: 'comLabel' }, "computer"))));
};
