import { playedWord } from "../types/types"

const updatePlayed = (played: playedWord[]) => {
    return {
        type: "UPDATEPLAYED",
        payload: played
    }
}

export default {
    updatePlayed,
    
}