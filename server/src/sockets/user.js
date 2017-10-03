// Libs & utils
import { party, user } from '../core'
import { socketUtils, generalUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

export const userSocketHandlers = {
	'WS_TO_SERVER_CONNECT_TO_PARTY': connectToParty,
	'WS_TO_SERVER_DISCONNECT_FROM_PARTY': disconnectFromAllParties,
	'WS_TO_SERVER_SET_VIDEO_PLAYER_STATE': setVideoPlayerState,
}

/**
 * Connect a user to a specific party and notify other clients in the party that a new user has joined
 *
 * @param io
 * @param socket
 * @param payload
 */
function connectToParty ( io, socket, payload ) {
	const { userName, partyId } = payload

	// Make sure the party we are trying to join actually exists
	// if not -> let the client know that the party he is trying to join doesn't exist
	if ( !party.partyExists ( partyId ) ) {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_STATE, 'inactive' )
		return false
	}

	// Create a new user if the user doesn't already exists
	user.createNewUser ( socket, userName )

	// Add the user to the party
	user.addUserToParty ( io, socket, partyId, userName )

	// Send all necessary party details to the user that just joined
	party.sendPartyDetailsToClient ( socket, partyId )

	// Only notify the party that a new user has joined if the joining user is authorized to be in the party
	if ( user.isAuthorizedInParty ( socket.id, partyId ) ) {
		party.notifyPartyOfNewlyJoinedUser ( io, partyId, userName )
	}
}

/**
 * Disconnect a client from all parties it is currently connected to
 * @param io
 * @param socket
 */
function disconnectFromAllParties ( io, socket ) {
	user.disconnectFromParty ( io, socket )
	user.resetPlayerStateForUser ( socket )
}

/**
 * Update a users' videoPlayer state, and if necessary, also the entire parties' videoPlayer state
 * @param io
 * @param socket
 * @param payload
 */
function setVideoPlayerState ( io, socket, payload ) {
	const userId = socket.id
	const { playerState, partyId } = payload
	const timeInVideo = generalUtils.toFixedNumber ( payload.timeInVideo, 1 )
	const newVideoPlayerState = { playerState, timeInVideo, lastStateChangeInitiator: userId }

	// Set / save the videoPlayers' state of a user so we know if the user is i.e. buffering or ready to play
	user.setUserVideoPlayerState ( userId, newVideoPlayerState )

	// If the user is authorized to update the playerState for the entire party AND
	// if this is a valid new playerState for the entire party -> update the playerState for the entire party
	if ( user.isAuthorizedInParty ( userId, partyId ) && party.isValidNewPlayerStateForParty ( partyId, newVideoPlayerState ) ) {
		party.onNewPlayerStateForParty ( io, socket, partyId, newVideoPlayerState )
	}else{
		if(playerState === 'playing'){
			console.log(timeInVideo)
		}
	}

	// If the party was waiting for a previous playerState change and all users are now done buffering ->
	// play the video for everyone in the party
	if ( party.allUsersReady ( partyId ) ) {
		// Toggle 'waitingForReady' to 'false' so we know that this party is no longer waiting for everyone to be ready
		party.toggleWaitingForPartyToBeReady ( partyId, false )

		// Play the video for everyone in the party
		party.playVideoForParty ( io, partyId )
	}
}