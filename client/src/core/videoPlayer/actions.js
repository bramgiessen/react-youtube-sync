// Utils & libs
import { debounce } from 'lodash'
import { generalUtils } from '../../core/utils'

// Import external actions
import { userActions } from '../user'

export const videoPlayerActions = {
	SET_USER_PLAYER_STATE: 'SET_USER_PLAYER_STATE',
	SET_PLAYER_LOADED_STATE: 'SET_PLAYER_LOADED_STATE',
	SET_PLAYER_MUTED_STATE: 'SET_PLAYER_MUTED_STATE',
	SET_PLAYER_MAXIMIZED_STATE: 'SET_PLAYER_MAXIMIZED_STATE',
	SET_PLAYER_PROGRESS: 'SET_PLAYER_PROGRESS',

	setUserVideoPlayerState: playerState => ({
		type: videoPlayerActions.SET_USER_PLAYER_STATE,
		payload: playerState
	}),

	setPlayerIsLoadedState: bool => ({
		type: videoPlayerActions.SET_PLAYER_LOADED_STATE,
		payload: bool
	}),

	setPlayerMutedState: bool => ({
		type: videoPlayerActions.SET_PLAYER_MUTED_STATE,
		payload: bool
	}),

	setPlayerMaximizedState: bool => ({
		type: videoPlayerActions.SET_PLAYER_MAXIMIZED_STATE,
		payload: bool
	}),

	setPlayerProgress: playerProgress => ({
		type: videoPlayerActions.SET_PLAYER_PROGRESS,
		payload: playerProgress.playedSeconds
	}),

	handleMaximizeBtnPressed: ( playerCurrentlyMaximized, videoPlayerElem ) => {
		return async function ( dispatch ) {
			if ( playerCurrentlyMaximized ) {
				generalUtils.exitFullScreen ()
			} else if ( !playerCurrentlyMaximized ) {
				generalUtils.requestFullScreenOnElement ( videoPlayerElem )
			}

			dispatch ( videoPlayerActions.setPlayerMaximizedState ( !playerCurrentlyMaximized ) )
		}
	},

	/**
	 * Store the new users' playerState and let the server know about the users' new playerState
	 * Reason for debouncing: because Youtube always fires a pause event right before a buffering event,
	 * we want to ignore this first, useless pause event
	 */
	onPlayerStateChange: ( userVideoPlayerState ) => {
		return async function ( dispatch ) {
			debouncedPlayerStateChangeHandler ( dispatch, userVideoPlayerState )
		}
	}
}

const debouncedPlayerStateChangeHandler = debounce ( ( dispatch, userVideoPlayerState ) => {
	const clientIsReady = userVideoPlayerState.playerState !== 'buffering'
	const timeInVideo = userVideoPlayerState.timeInVideo

	dispatch ( videoPlayerActions.setUserVideoPlayerState ( userVideoPlayerState ) )
	dispatch ( userActions.emitClientReadyStateToServer ( {
		clientIsReady,
		timeInVideo
	} ) )
}, 500 )