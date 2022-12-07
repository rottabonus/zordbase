import React, { useRef, useEffect } from 'react';
import { BalanceOfPower } from './BalanceOfPower';
import { useSelector } from 'react-redux';
import { useWindowSize } from '../hooks/windowSize';
export var PlayedWordList = function (props) {
    var played = useSelector(function (state) { return state.base.playedWords; });
    var playerName = useSelector(function (state) { return state.base.playerName; });
    var base = useSelector(function (state) { return state.base.base; });
    var isLoading = useSelector(function (state) { return state.board.isLoading; });
    var playerNodes = base.filter(function (f) { return f.owner === playerName; }).length;
    var comNodes = base.filter(function (f) { return f.owner === 'computer'; }).length;
    var percentageDifference = isLoading ? 50 : ((playerNodes - comNodes) / (playerNodes + comNodes / 2) * 100) + 50;
    var messagesEndRef = useRef(null);
    var size = useWindowSize();
    var getWordStyle = function (owner) {
        return owner === 'computer' ? { color: 'khaki', textAlign: 'right' } : { color: '#87b6b8', textAlign: 'left' };
    };
    var scrollToBottom = function () {
        if (size.width > 550) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
    useEffect(function () {
        scrollToBottom();
    }, [played]);
    return React.createElement("div", { className: 'wordListContainer' },
        React.createElement(BalanceOfPower, { playerPercentage: percentageDifference, playerName: playerName }),
        React.createElement("div", { className: 'wordListWords' },
            played.map(function (w, i) {
                var styleValues = getWordStyle(w.owner);
                return (React.createElement("span", { key: i, onClick: function () { return props.timeTravel(w.turn); }, style: { color: styleValues.color, textAlign: styleValues.textAlign, cursor: 'pointer', padding: '4px' } }, w.word));
            }),
            React.createElement("div", { ref: messagesEndRef })));
};
