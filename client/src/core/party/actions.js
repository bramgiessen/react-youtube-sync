//=====================================
//  Party Actions : Containing WEBSOCKET connected actions:
//					These actions automatically get send to the backend/server
//					as messages over websockets. This is handled automatically through
//					the middleware 'redux-socket.io' by prefixing these specific actions
// 					with the string 'WS_TO_SERVER_'.
//-------------------------------------

export const partyActions = {

	// INCOMING FROM SERVER
    // Actions that get initiated by incoming WEBSOCKET messages from the backend/server
    WS_TO_CLIENT_SET_PARTY_ID: 'WS_TO_CLIENT_SET_PARTY_ID',
    WS_TO_CLIENT_SET_PARTY_STATE: 'WS_TO_CLIENT_SET_PARTY_STATE',
    WS_TO_CLIENT_SET_SELECTED_VIDEO: 'WS_TO_CLIENT_SET_SELECTED_VIDEO',
    WS_TO_CLIENT_PARTY_MESSAGE_RECEIVED: 'WS_TO_CLIENT_PARTY_MESSAGE_RECEIVED',
    WS_TO_CLIENT_SET_USERS_IN_PARTY: 'WS_TO_CLIENT_SET_USERS_IN_PARTY',
	WS_TO_CLIENT_SET_PLAYER_STATE: 'WS_TO_CLIENT_SET_PLAYER_STATE',

	// OUTGOING TO SERVER
	// Actions that after dispatching automatically get sent
	// as messages over WEBSOCKETS to the backend/server
    WS_TO_SERVER_CREATE_PARTY: 'WS_TO_SERVER_CREATE_PARTY',
    WS_TO_SERVER_SEND_MESSAGE_TO_PARTY: 'WS_TO_SERVER_SEND_MESSAGE_TO_PARTY',
    WS_TO_SERVER_SET_VIDEO_PLAYER_STATE: 'WS_TO_SERVER_SET_VIDEO_PLAYER_STATE',

	createParty: (videoDetails, videoSource) => ({
		type: partyActions.WS_TO_SERVER_CREATE_PARTY,
        payload: { ...videoDetails, videoSource }
	}),

	sendMessageToParty: ( message, userName, partyId ) => ({
		type: partyActions.WS_TO_SERVER_SEND_MESSAGE_TO_PARTY,
		payload: { message, userName, partyId }
	}),

	emitNewPlayerStateForPartyToServer: ( newPlayerState, partyId ) => ({
		type: partyActions.WS_TO_SERVER_SET_VIDEO_PLAYER_STATE,
		payload: { newPlayerState, partyId }
	})

}