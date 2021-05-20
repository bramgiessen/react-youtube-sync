// Libs & utils
import { party } from '../core/index.js'
import { socketUtils, generalUtils } from "../utils/index.js"
import { user } from "../core/user.js"

// Constants
import { ACTION_TYPES } from '../core/constants'

// Bind incoming action types to handler functions
export const partySocketHandlers = {
	'WS_TO_SERVER_CREATE_PARTY': createParty,
	'WS_TO_SERVER_SEND_MESSAGE_TO_PARTY': sendMessageToParty,
	'WS_TO_SERVER_SET_VIDEO_PLAYER_STATE': setVideoPlayerStateForParty
}

/**
 * Create a new party and emit the newly generated partyId back to the client
 * @param io
 * @param socket
 * @param video
 */
function createParty ( io, socket, video ) {
	const partyId = party.createParty ( io, socket, video )

	socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_PARTY_ID, partyId )
}

/**
 * Broadcast a message to an entire party
 * @param io
 * @param socket
 * @param payload
 */
function sendMessageToParty ( io, socket, payload ) {
	const { message, partyId, userName } = payload

	if ( message && partyId && userName ) {
		party.sendMessageToParty ( io, message, partyId, userName )
	}
}

/**
 * Set a videoPlayer state for an entire party
 * ( Triggered when a user in a party i.e. pauses, seeks in or plays the video )
 * @param io
 * @param socket
 * @param payload
 */
function setVideoPlayerStateForParty ( io, socket, payload ) {
	const userId = socket.id
	const { newPlayerState, partyId } = payload
	const playerStateForParty = {
		playerState: newPlayerState.playerState,
		timeInVideo: generalUtils.toFixedNumber ( newPlayerState.timeInVideo, 2 )
	}

	if ( user.isUserAuthenticated ( userId ) ) {
		party.onNewPlayerStateForParty ( io, socket, partyId, playerStateForParty )
	}
}