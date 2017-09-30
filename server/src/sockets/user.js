// Libs & utils
import { party, user } from '../core'
import { messageUtils, socketUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

export const userSocketHandlers = {
	'WS_TO_SERVER_CONNECT_TO_PARTY': connectToParty,
	'WS_TO_SERVER_DISCONNECT_FROM_PARTY': disconnectFromAllParties,
}

/**
 * Connect a user to a specific party
 *
 * 1. Gather necessary details about the party
 * 2. Add the user to the party
 * 3. Emit all necessary party details back to the just connected user
 *
 * @param io
 * @param socket
 * @param payload
 */
function connectToParty ( io, socket, payload ) {
	const { userName, partyId } = payload
	let userJoinedMessage

	// Make sure the party we are trying to join actually exists
	// if not -> let the client know that the party he is trying to join doesn't exist
	if ( !party.partyExists ( partyId ) ) {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_STATE, 'inactive' )
		return false
	}

	// ONLY if the client provides a username -> add him to the party
	if ( userName ) {
		// Create a new message to let everybody know that a new user just joined the party
		userJoinedMessage = messageUtils.generateUserJoinedMessage ( userName, partyId )
	} else {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_STATE, 'inactive' )
	}

	// Create a new user if the user doesn't already exists
	user.createNewUser ( socket, userName )

	// Add the user to the party
	user.addUserToParty ( io, socket, partyId, userName )

	// Gather the selected video details for the party
	const videoForParty = party.getSelectedVideoForParty ( partyId )

	// Get the current Video player state for the party
	const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )

	// Gather the list of users currently connected to the party
	const usersInParty = party.getUsersForParty ( partyId )

	// Gather all messages that have previously been posted in the party
	// and add a new message to let everybody know that a new user just joined the party
	const messagesInParty = party.getMessagesInParty ( partyId )
	if ( userJoinedMessage ) {
		messagesInParty.push ( userJoinedMessage )
	}

	// If the party is valid and thus has a selected video -> emit all gathered party details to the just connected user
	if ( videoForParty ) {
		// Let the client know which video is selected in the party:
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_SELECTED_VIDEO, videoForParty )

		// Let the client know what the current playerState is in the party ('playing', 'paused' etc.)
		if ( videoPlayerForParty.timeInVideo !== 0 ) {
			socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_PLAYER_STATE, videoPlayerForParty )
		}

		// Let the client know which other users are currently connected to the party
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.SET_USERS_IN_PARTY, usersInParty )

		// Resend all messages that have been posted in the party to all clients in the party
		// todo: optimize by sending ONLY NEW messages to already connected users instead of resending ALL messages
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.PARTY_MESSAGE_RECEIVED, messagesInParty )
	}
}

/**
 * Disconnect a client from all parties it is currently connected to
 * @param io
 * @param socket
 */
function disconnectFromAllParties ( io, socket ) {
	user.disconnectFromParty ( io, socket )
}