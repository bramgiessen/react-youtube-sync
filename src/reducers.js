// Libs & utils
import { combineReducers } from 'redux'

// Reducers
import { appReducer } from './components/app/redux/appReducer'

export default combineReducers ( {
	app: appReducer
} )