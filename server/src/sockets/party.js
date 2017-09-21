// Libs & utils
import { party, user } from '../core'
import { socketUtils, messageUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

export const partySocketHandlers = {
	'WS_TO_SERVER_CREATE_PARTY': createParty,
	'WS_TO_SERVER_SEND_MESSAGE_TO_PARTY': sendMessageToParty,
	'WS_TO_SERVER_SET_VIDEO_PLAYER_STATE': setVideoPlayerState,
}

/**
 * Create a new party and emit the newly generated partyId back to the client
 * @param io
 * @param socket
 * @param video
 */
function createParty ( io, socket, video ) {
	const partyId = party.createParty ( io, socket, video )

    socketUtils.emitActionToClient( socket, ACTION_TYPES.SET_PARTY_ID, partyId )
}

/**
 * Broadcast a message to an entire party
 * @param io
 * @param socket
 * @param payload
 */
function sendMessageToParty ( io, socket, payload ) {
	const { message, partyId, userName } = payload

	if(message && partyId && userName){
        party.sendMessageToParty ( io, socket, message, partyId, userName )
    }
}

/**
 * Set the state of the videoPlayer for a party (I.e. 'playing', 'paused', 'ended'.. )
 * @param io
 * @param socket
 * @param payload
 */
function setVideoPlayerState ( io, socket, payload ) {
    const { playerState, timeInVideo, partyId } = payload

    // If the user is not in the party he is trying to set the playerState for
    // or has no userName (and thus is not authenticated) -> abort!
    if(!user.isAuthorizedInParty(socket.id, partyId)){
        return false
    }

   	// Update the playerState
    party.setPlayerState(io, socket, playerState, timeInVideo, partyId , () => {
        // Retrieve the new playerState
        const newPlayerState = party.getVideoPlayerForParty( partyId )
        console.log(newPlayerState)

        // Update all clients in the party EXCEPT the client that changed the playerState itself
        // with the new playerState
        socketUtils.broadcastActionToParty( socket, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, newPlayerState )

        // If the playerState has been changed to 'paused' or 'playing' ->
        // send everyone in the party a message explaining that this user updated the playerState
        if ( playerState === 'playing' || playerState === 'paused' ) {
            const userForSocketId = user.getUserForId( socket.id )
            const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage(userForSocketId.userName, playerState, timeInVideo)
            party.sendMessageToParty(io, socket, playerStateChangeMessage, partyId, 'Server')
        }
    })
}