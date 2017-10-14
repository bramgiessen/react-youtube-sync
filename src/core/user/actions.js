//=====================================
//  User Actions : 	Containing WEBSOCKET connected actions:
//					These actions automatically get send to the backend/server
//					as messages over websockets. This is handled automatically through
//					the middleware 'redux-socket.io' by prefixing these specific actions
// 					with the string 'WS_TO_SERVER_'.
//-------------------------------------

export const userActions = {
	// Normal / local redux actions
	SET_USER_NAME: 'SET_USER_NAME',

	// OUTGOING TO SERVER
	// Actions that after dispatching automatically get sent
	// as messages over WEBSOCKETS to the backend/server
	WS_TO_SERVER_CONNECT_TO_PARTY: 'WS_TO_SERVER_CONNECT_TO_PARTY',
	WS_TO_SERVER_DISCONNECT_FROM_PARTY: 'WS_TO_SERVER_DISCONNECT_FROM_PARTY',
	WS_TO_SERVER_SET_CLIENT_READY_STATE: 'WS_TO_SERVER_SET_CLIENT_READY_STATE',

	setUserName: userName => ({
		type: userActions.SET_USER_NAME,
		payload: userName
	}),

	connectToParty: ( userName, partyId ) => ({
		type: userActions.WS_TO_SERVER_CONNECT_TO_PARTY,
		payload: { userName, partyId }
	}),

	emitClientReadyStateToServer: ( clientReadyState ) => ({
		type: userActions.WS_TO_SERVER_SET_CLIENT_READY_STATE,
		payload: { ...clientReadyState }
	}),

	disconnectFromAllParties: () => ({
		type: userActions.WS_TO_SERVER_DISCONNECT_FROM_PARTY
	}),

}