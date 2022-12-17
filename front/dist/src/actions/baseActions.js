const updateBase = (base) => {
    return {
        type: "UPDATEBASE",
        payload: base,
    };
};
const createBase = (base) => {
    const possibleWordsTable = {};
    for (const [i, letter] of base.entries()) {
        for (const [j, possibility] of letter.possibleWords.entries()) {
            const word = letter.letter + possibility.map((o) => o.letter).join("");
            if (!(word in possibleWordsTable)) {
                possibleWordsTable[word] = [`${letter.row},${letter.column}`];
            }
            else {
                possibleWordsTable[word].push(`${letter.row},${letter.column}`);
            }
        }
    }
    return {
        type: "CREATEBASE",
        payload: { base, possibleWordPositions: possibleWordsTable },
    };
};
const updateSelection = (selection) => {
    return {
        type: "UPDATESELECTION",
        payload: selection,
    };
};
const removeSelectionAndPlayedWords = (selection, played) => {
    const history = { base: [], selection: [], turn: "" };
    return {
        type: "REMOVESELECTIONANDPLAYED",
        payload: { selection, played, history },
    };
};
const removeFromSelection = (index) => {
    return {
        type: "REMOVEFROMSELECTION",
        payload: index,
    };
};
const updatePlayedWords = (played) => {
    return {
        type: "UPDATEPLAYEDWORDS",
        payload: played,
    };
};
const confirmSelection = (base, played, selection) => {
    return {
        type: "CONFIRMSELECTION",
        payload: { base, played, selection },
    };
};
const changePlayerName = (playerName) => {
    return {
        type: "CHANGEPLAYERNAME",
        payload: playerName,
    };
};
const resetBase = (base) => {
    const played = [];
    const selection = [];
    const history = { base: [], selection: [], turn: "" };
    return {
        type: "RESETGAME",
        payload: { base, played, selection, history },
    };
};
const startingBase = (base, max, playerName) => {
    const startingBase = base.map((letter) => {
        if (letter.row === 0) {
            letter = { ...letter, owner: playerName };
        }
        else if (letter.row === max - 1) {
            letter = { ...letter, owner: "computer" };
        }
        else {
            letter = { ...letter, owner: "none" };
        }
        return letter;
    });
    return startingBase;
};
const createHistory = (base, selection, turn) => {
    return {
        type: "CREATEHISTORY",
        payload: { base, selection, turn },
    };
};
export default {
    updateBase,
    updateSelection,
    createBase,
    removeFromSelection,
    updatePlayedWords,
    confirmSelection,
    changePlayerName,
    resetBase,
    removeSelectionAndPlayedWords,
    createHistory,
};
