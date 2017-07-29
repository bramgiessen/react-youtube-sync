// Libs & utils
import { combineReducers } from 'redux'

// Reducers
import { appReducer } from './components/app/redux/appReducer'
import { searchBarReducer } from './components/searchBar/redux/searchBarReducer'

export default combineReducers ( {
	app: appReducer,
	searchBar: searchBarReducer
} )