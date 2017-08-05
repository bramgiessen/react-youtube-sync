// Libs & utils
import { combineReducers } from 'redux'

// Reducers
import { appReducer } from './app/index'
import { searchReducer } from './search/index'
import { videoListReducer } from './videoList/index'
import { userReducer } from './user/index'
import { partyReducer } from './party/index'

export default combineReducers ( {
	app: appReducer,
	videoList: videoListReducer,
	user: userReducer,
	search: searchReducer,
	party: partyReducer
} )