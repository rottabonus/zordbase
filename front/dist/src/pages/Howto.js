import React from 'react';
export var Howto = function () {
    return (React.createElement("div", { className: 'howto-page-container' },
        React.createElement("div", { className: 'howto-header' },
            React.createElement("h2", null, "How to play")),
        React.createElement("div", { className: 'howto-paragraph' },
            React.createElement("p", null, "The goal is to reach the opponents base by playing words."),
            React.createElement("p", null, "Words are created by selecting letters one by one."),
            React.createElement("p", null, "Letter selection must start from your own base, and only the neighboring node can be selected. However you can move in any direction."),
            React.createElement("p", null,
                "Bases are highlighted by colors. ",
                React.createElement("span", { style: { color: '#87b6b8' } }, "Player"),
                " starts from top and ",
                React.createElement("span", { style: { color: 'khaki' } }, "computer"),
                " from bottom"),
            React.createElement("p", null,
                " When you are happy with your selection, you may confirm the selection from the confirm-button ",
                React.createElement("i", { className: "fa fa-chevron-circle-down" }),
                ", on the bottom of the board."),
            React.createElement("p", null, "Every time a word is played, your base is expanded. All nodes that are not connected to your base, are cut off. This way you may block your opponents advances. "),
            React.createElement("p", null, "The words must be in the basic form and at the moment only Finnish wordlist is found in the game."),
            React.createElement("p", null, "Have fun!"))));
};
