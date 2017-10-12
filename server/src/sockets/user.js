// Libs & utils
import { party, user } from '../core'
import { socketUtils, generalUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

// Bind incoming action types to handler functions
export const userSocketHandlers = {
	'WS_TO_SERVER_CONNECT_TO_PARTY': connectToParty,
	'WS_TO_SERVER_DISCONNECT_FROM_PARTY': disconnectFromParty,
	'WS_TO_SERVER_SET_CLIENT_READY_STATE': setUserReadyState,
	'WS_TO_SERVER_SET_CLIENT_VIDEOPLAYER_INITIALIZED': setUserReadyState,
}

/**
 * Connect a user to a specific party and notify other clients in the party that a new user has joined
 *
 * @param io
 * @param socket
 * @param payload
 */
function connectToParty ( io, socket, payload ) {
	const userId = socket.id
	const { userName, partyId } = payload

	// Make sure the party we are trying to join actually exists
	// if not -> let the user know that the party he is trying to join doesn't exist
	if ( !party.partyExists ( partyId ) ) {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_STATE, 'inactive' )
		return false
	}else{
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_STATE, 'active' )
	}

	// Create a new user if the user doesn't already exists, otherwise update the users' userName
	user.createNewUser ( userId, userName )

	// Add the user to the party
	user.addUserToParty ( io, socket, partyId, userName )

	// Send all necessary party details to the user that just joined
	party.sendPartyDetailsToClient ( socket, partyId )

	// Only notify the party that a new user has joined if the joining user is authenticated
	if ( user.isUserAuthenticated ( userId ) ) {
		party.notifyPartyOfNewlyJoinedUser ( io, partyId, userName )
	}
}

/**
 * Disconnect a client from all parties it is currently connected to
 * @param io
 * @param socket
 */
function disconnectFromParty ( io, socket ) {
	user.disconnectFromParty ( io, socket )
	user.resetClientToInitialState ( socket )
}

/**
 * Mark a user as readyToPlay [== done buffering] or !readyToPlay [== buffering]
 * @param io
 * @param socket
 * @param payload
 */
function setUserReadyState ( io, socket, payload ) {
	const userId = socket.id
	const partyIdForUser = user.getPartyIdForUser ( userId )
	// Don't continue if this user is not a member of any parties
	if ( !partyIdForUser ) {
		return false
	}

	const { clientIsReady, timeInVideo } = payload
	const userForId = user.getUserForId ( userId )
	const isNewReadyStateForClient = clientIsReady !== userForId.readyToPlayState.clientIsReady
	const readyToPlayState = {
		clientIsReady,
		timeInVideo: generalUtils.toFixedNumber ( timeInVideo, 2 )
	}

	// If the user previously was not ready to play and is now ready
	// OR if this client is not ready to play anymore (because he/she is buffering)
	// -> store that readyToPlay state for the user
	if ( isNewReadyStateForClient || !clientIsReady ) {
		// Store the new userReadyState for the user
		user.setUserReadyToPlayState ( userId, readyToPlayState )
	}

	if ( !clientIsReady ) {
		// If the user is not ready to play -> pause the video for everyone in the party until this user is ready
		party.handleUserInPartyNotReady ( io, userId, partyIdForUser )
	} else if ( isNewReadyStateForClient && party.allUsersReady ( partyIdForUser ) ) {
		// If all users are now ready -> play the video for everyone in the party
		party.handleAllUsersInPartyReady ( io, partyIdForUser )
	}
}