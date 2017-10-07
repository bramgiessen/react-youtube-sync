// Utils & libs
import { generalUtils } from '../../core/utils'

export const videoPlayerActions = {
	SET_PLAYER_MUTED_STATE: 'SET_PLAYER_MUTED_STATE',
	SET_PLAYER_MAXIMIZED_STATE: 'SET_PLAYER_MAXIMIZED_STATE',
	SET_PLAYER_LOADED_STATE: 'SET_PLAYER_LOADED_STATE',
	SET_PLAYER_PROGRESS: 'SET_PLAYER_PROGRESS',


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
}