import boardReducer from './boardReducer'
import baseReducer from './baseReducer'
import playedWordReducer from './playedWordReducer'

import { combineReducers } from 'redux'

const rootReducer = combineReducers({
    board: boardReducer,
    base: baseReducer,
    played: playedWordReducer
})

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;