// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { appActions } from './appActions'

const initialState = Immutable ( {
	isFetching: false,
	userName: null,
	error: null
} )

export const appReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case appActions.SET_USER_NAME:
			return Immutable.set ( state, 'userName', action.payload )

		default:
			return state
	}
}