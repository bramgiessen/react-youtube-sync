export const partyActions = {
	SET_PARTY_ID: 'SET_PARTY_ID',
	WEBSOCKET_CREATE_PARTY: 'WEBSOCKET_CREATE_PARTY',
	WEBSOCKET_SET_SELECTED_VIDEO: 'WEBSOCKET_SET_SELECTED_VIDEO',
	WEBSOCKET_CONNECT_TO_PARTY: 'WEBSOCKET_CONNECT_TO_PARTY',
	WEBSOCKET_DISCONNECT_FROM_PARTY: 'WEBSOCKET_DISCONNECT_FROM_PARTY',
	WEBSOCKET_SEND_MESSAGE_TO_PARTY: 'WEBSOCKET_SEND_MESSAGE_TO_PARTY',
	WEBSOCKET_SET_VIDEO_PLAYER_STATE: 'WEBSOCKET_SET_VIDEO_PLAYER_STATE',
	SET_SELECTED_VIDEO: 'SET_SELECTED_VIDEO',
	PARTY_MESSAGE_RECEIVED: 'PARTY_MESSAGE_RECEIVED',
	SET_USERS_IN_PARTY: 'SET_USERS_IN_PARTY',
	SET_PARTY_PLAYER_STATE: 'SET_PARTY_PLAYER_STATE',

	createParty: () => ({
		type: partyActions.WEBSOCKET_CREATE_PARTY
	}),

	setSelectedVideo: ( videoDetails, videoSource ) => ({
		type: partyActions.WEBSOCKET_SET_SELECTED_VIDEO,
		payload: { ...videoDetails, videoSource }
	}),

	connectToParty: ( userName, partyId ) => ({
		type: partyActions.WEBSOCKET_CONNECT_TO_PARTY,
		payload: { userName, partyId }
	}),

	disconnectFromAllParties: () => ({
		type: partyActions.WEBSOCKET_DISCONNECT_FROM_PARTY
	}),

	sendMessageToParty: ( message, userName, partyId ) => ({
		type: partyActions.WEBSOCKET_SEND_MESSAGE_TO_PARTY,
		payload: { message, userName, partyId }
	}),

	setVideoPlayerState: ( playerState, timeInVideo, partyId ) => ({
		type: partyActions.WEBSOCKET_SET_VIDEO_PLAYER_STATE,
		payload: { playerState, timeInVideo, partyId }
	})

}