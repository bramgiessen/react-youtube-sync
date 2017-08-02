// Libs & utils
import { combineReducers } from 'redux'

// Reducers
import { searchReducer } from './core/search/index'
import { videoListReducer } from './core/videoList/index'
import { userReducer } from './core/user/index'

export default combineReducers ( {
	videoList: videoListReducer,
	user: userReducer,
	search: searchReducer
} )