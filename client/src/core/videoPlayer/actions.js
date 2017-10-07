export const videoPlayerActions = {
	SET_PLAYER_MUTED_STATE: 'SET_PLAYER_MUTED_STATE',


	setPlayerMutedState: bool => ({
		type: videoPlayerActions.SET_PLAYER_MUTED_STATE,
		payload: bool
	}),

}