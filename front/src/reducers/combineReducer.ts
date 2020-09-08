import boardReducer from './boardReducer'
import baseReducer from './baseReducer'

import { combineReducers } from 'redux'

const rootReducer = combineReducers({
    board: boardReducer,
    base: baseReducer
})

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;