// Libs & utils
import Immutable from 'seamless-immutable'
import { persistUtils } from "../utils/index"

// Actions
import { userActions } from './index'

// read stored userName from local storage -> defaults to null if it doesn't exist
const userNameFromLocalStorage = persistUtils.loadProperty ( 'userName', null )

const initialState = Immutable ( {
	userName: userNameFromLocalStorage,
} )

export const userReducer = ( state = initialState, action ) => {
	switch ( action.type ) {

		case userActions.SET_USER_NAME:
			if ( action.payload && action.payload.length ) {
				// Save / overwrite the username in localstorage && on the server
				persistUtils.saveProperty('userName', action.payload)
				return Immutable.set ( state, 'userName', action.payload )
			}
			break;

		default:
			return state
	}
}