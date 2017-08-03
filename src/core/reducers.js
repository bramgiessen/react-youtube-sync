// Libs & utils
import { combineReducers } from 'redux'

// Reducers
import { searchReducer } from './search/index'
import { videoListReducer } from './videoList/index'
import { userReducer } from './user/index'

export default combineReducers ( {
	videoList: videoListReducer,
	user: userReducer,
	search: searchReducer
} )