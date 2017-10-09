// Libs & utils
import { party, user } from '../core'
import { socketUtils, generalUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

export const userSocketHandlers = {
	'WS_TO_SERVER_CONNECT_TO_PARTY': connectToParty,
	'WS_TO_SERVER_DISCONNECT_FROM_PARTY': disconnectFromAllParties,
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
	user.resetClientToInitialState( socket )
}

/**
 * Mark a user as readyToPlay [== done buffering] or not
 * @param io
 * @param socket
 * @param payload
 */
function setUserReadyState ( io, socket, payload ) {
	const partyIdForUser = user.getPartyIdsForUser ( socket.id )[ 0 ]
	if ( !partyIdForUser ) {
		return false
	}
	const partyForId = party.getPartyById ( partyIdForUser )
	const userForId = user.getUserForId ( socket.id )
	const currentPlayerStateForParty = partyForId.videoPlayer.playerState
	const { clientIsReady } = payload
	const readyToPlayState = {
		clientIsReady,
		timeInVideo: generalUtils.toFixedNumber ( payload.timeInVideo, 2 )
	}


	if(clientIsReady !== userForId.readyToPlayState.clientIsReady || !clientIsReady){

		// Store the new userReadyState for the user
		user.setUserReadyToPlayState ( socket.id, readyToPlayState )

		// If a client reports to not be ready -> pause the video for everyone until everyone is ready again
		// ( We're using a timeOut because otherwise the client's Youtube player can get stuck in an
		//   infinite 'buffering' state )

		// Only pause the video if this isnt the initial video play command as the video was still paused at this
		// point (otherwise will trigger infinite buffer bug)
		if(!clientIsReady && readyToPlayState.timeInVideo !== 0){
			party.pauseVideoForParty(io, socket, partyIdForUser, readyToPlayState)
		}

		// If all users are ready, and the current parties' playerState is 'playing'
		// -> play the video for all users
		else if ( party.allUsersReady ( partyIdForUser ) ) {
			if(currentPlayerStateForParty === 'playing'){
					party.playVideoForParty ( io, partyIdForUser )
			}
			else if(currentPlayerStateForParty === 'paused'){
				party.pauseVideoForParty(io,socket,partyIdForUser,readyToPlayState)
			}
		}
	}

}