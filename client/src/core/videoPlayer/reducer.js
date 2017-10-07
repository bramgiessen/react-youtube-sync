// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { videoPlayerActions } from './index'

const initialState = Immutable ( {
	videoPlayerIsMuted: false,
	videoPlayerIsMaximized: false,
	videoPlayerIsLoaded: false,
	videoProgress: 0
} )

export const videoPlayerReducer = ( state = initialState, action ) => {
	switch ( action.type ) {

		case videoPlayerActions.SET_PLAYER_LOADED_STATE:
			return Immutable.set ( state, 'videoPlayerIsLoaded', action.payload )

		case videoPlayerActions.SET_PLAYER_MUTED_STATE:
			return Immutable.set ( state, 'videoPlayerIsMuted', action.payload )

		case videoPlayerActions.SET_PLAYER_MAXIMIZED_STATE:
			return Immutable.set ( state, 'videoPlayerIsMaximized', action.payload )

		case videoPlayerActions.SET_PLAYER_PROGRESS:
			return Immutable.set ( state, 'videoProgress', action.payload )

		default:
			return state
	}
}