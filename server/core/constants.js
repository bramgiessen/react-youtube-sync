//=====================================
//  ACTION TYPES
//-------------------------------------
export const ACTION_TYPES = {

	// PARTY ACTION TYPES
	SET_PARTY_ID: 'WS_TO_CLIENT_SET_PARTY_ID',
	SET_PARTY_STATE: 'WS_TO_CLIENT_SET_PARTY_STATE',
	SET_SELECTED_VIDEO: 'WS_TO_CLIENT_SET_SELECTED_VIDEO',
	SET_CLIENT_PLAYER_STATE: 'WS_TO_CLIENT_SET_PLAYER_STATE',
	SET_USERS_IN_PARTY: 'WS_TO_CLIENT_SET_USERS_IN_PARTY',
	PARTY_MESSAGE_RECEIVED: 'WS_TO_CLIENT_PARTY_MESSAGE_RECEIVED'
}

//=====================================
//  VARIOUS
//-------------------------------------
// The username shown in the chatlog when the server emits an informative message
// to a party
export const serverUserName = 'Party'