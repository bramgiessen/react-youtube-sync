// Libs & utils
import Immutable from 'seamless-immutable'
import { loadProperty, saveProperty } from "../../../utils/persist"

// Actions
import { appActions } from './appActions'

// read stored userName from local storage -> defaults to null if it doesn't exist
const userNameFromLocalStorage = loadProperty ( 'userName', null )

const initialState = Immutable ( {
	isFetching: false,
	userName: userNameFromLocalStorage,
	youtubeVideos: null,
	error: null
} )

export const appReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case appActions.SET_USER_NAME:
			// Save / overwrite the username in localstorage
			saveProperty('userName', action.payload)
			return Immutable.set ( state, 'userName', action.payload )

		case appActions.IS_FETCHING:
			return Immutable.set ( state, 'isFetching', action.payload )

		case appActions.SET_YOUTUBE_SEARCH_RESULTS:
			return Immutable.set ( state, 'youtubeVideos', action.payload )

		default:
			return state
	}
}