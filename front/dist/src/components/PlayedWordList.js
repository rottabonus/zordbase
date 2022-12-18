import React, { useRef, useEffect } from "react";
import { BalanceOfPower } from "./BalanceOfPower";
import { useSelector } from "react-redux";
import { useWindowSize } from "../hooks/windowSize";
import { selectBoard } from "../reducers/boardReducer";
import { selectBase } from "../reducers/baseReducer";
export const PlayedWordList = (props) => {
    const { base, playerName, playedWords: played } = useSelector(selectBase);
    const { isLoading } = useSelector(selectBoard);
    const playerNodes = base.filter((f) => f.owner === playerName).length;
    const comNodes = base.filter((f) => f.owner === "computer").length;
    const percentageDifference = isLoading
        ? 50
        : ((playerNodes - comNodes) / (playerNodes + comNodes / 2)) * 100 + 50;
    const messagesEndRef = useRef(null);
    const size = useWindowSize();
    const getWordStyle = (owner) => {
        return owner === "computer"
            ? { color: "khaki", textAlign: "right" }
            : { color: "#87b6b8", textAlign: "left" };
    };
    const scrollToBottom = () => {
        if (size.width > 550) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };
    useEffect(() => {
        scrollToBottom();
    }, [played]);
    return (React.createElement("div", { className: "wordListContainer" },
        React.createElement(BalanceOfPower, { playerPercentage: percentageDifference, playerName: playerName }),
        React.createElement("div", { className: "wordListWords" },
            played.map((w, i) => {
                const styleValues = getWordStyle(w.owner);
                return (React.createElement("span", { key: i, onClick: () => props.timeTravel(w.turn), style: {
                        color: styleValues.color,
                        textAlign: styleValues.textAlign,
                        cursor: "pointer",
                        padding: "4px",
                    } }, w.word));
            }),
            React.createElement("div", { ref: messagesEndRef }))));
};
