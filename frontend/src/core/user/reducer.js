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
			// Save / overwrite the username in localstorage
			persistUtils.saveProperty('userName', action.payload)
			return Immutable.set ( state, 'userName', action.payload )

		default:
			return state
	}
}