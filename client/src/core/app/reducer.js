// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { appActions } from './index'

const initialState = Immutable ( {
	currentPath: '/'
} )

export const appReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case appActions.NAVIGATE_TO_PATH:
			return Immutable.set ( state, 'currentPath', action.payload )

		default:
			return state
	}
}