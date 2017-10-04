// Libs & utils
import { party } from '../core'
import { socketUtils, generalUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

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

function setVideoPlayerStateForParty (io, socket, payload) {
	const { newPlayerState, partyId } = payload
	const playerStateForParty = {
		playerState: newPlayerState.playerState,
		timeInVideo: generalUtils.toFixedNumber(newPlayerState.timeInVideo, 2),
		stateChangeActionId: generalUtils.generateId(15)
	}

	party.onNewPlayerStateForParty(io, socket, partyId, playerStateForParty)
}