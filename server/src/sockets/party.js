// Libs & utils
import { party, user } from '../core'
import { socketUtils, messageUtils, generalUtils } from "../utils"

// Constants
import { ACTION_TYPES } from '../core/constants'

export const partySocketHandlers = {
	'WS_TO_SERVER_CREATE_PARTY': createParty,
	'WS_TO_SERVER_SEND_MESSAGE_TO_PARTY': sendMessageToParty,
	'WS_TO_SERVER_SET_VIDEO_PLAYER_STATE': setPartyVideoPlayerState,
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
 * Logarithm that switches the videoPlayers' state of an entire party based on actions received from clients/users in a party
 *
 * This logarithm is built specifically for the interaction with clients that use a Youtube videoPlayer, as this player
 * has a very specific event ('onStateChange') that fires every time the clients' videoPlayers' state changes. The input
 * from this event is necessary for this logarithm to function.
 *
 * Given that a user wants to change the playerState from 'paused' to 'playing', this function works as follows:
 * 1. We receive input from a user that would like to change the state of the videoPlayer (from 'paused' to 'playing')
 * 2. We check the current videoPlayers' state for the party
 * 3. If the input from the user is different from the current videoPlayers' state for the party
 *    -> we update the current videoPlayers' state for the party
 * 4. We send out a paused command to everybody in the party with the time in the video the user wants to play the video at
 *    so we can make everyone start buffering
 * 5. We wait until no one in the party is buffering anymore
 * 6. We send out a 'playing' command to everyone in the party, so that everyone starts playing the video
 *
 * @param io
 * @param socket
 * @param payload
 * @returns {boolean}
 */
function setPartyVideoPlayerState (io, socket, payload) {
    const {playerState, partyId} = payload
    const timeInVideo = generalUtils.toFixedNumber(payload.timeInVideo, 1)

    // If the user is not in the party he is trying to set the playerState for
    // or has no userName (and thus is not authenticated) -> abort!
    if (!user.isAuthorizedInParty(socket.id, partyId)) {
        return false
    }

    // Set / save the videoPlayers' state of a user so we know if the user is i.e. buffering or ready to play
    if(playerState === 'playing' || playerState === 'paused') {
        user.setUserVideoPlayerState(socket.id, {playerState, timeInVideo})
    }

    // If someone in the party is trying to set a new videoPlayer state for the party,
    // and the party was not waiting for a previous player state change to be completed
    // --> set a new playerState for the entire party
    if(!party.isWaitingToBeReady(partyId) && party.isNewPlayerStateForParty(partyId, playerState, timeInVideo)){
        party.setPlayerState(playerState, timeInVideo, partyId, socket.id)

        // Clear the current videoPlayer interval for this party
        party.toggleVideoPlayerInterval(partyId, false)

        // If a user is pausing the video -> broadcast this action to everyone else in the party,
        // no need to emit this action back to the initiating user as he already paused his videoPlayer
        if(playerState === 'paused'){
            // Generate a message to let the rest of the party know that this user has paused the video
            const userForSocketId = user.getUserForId(socket.id)
            const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage(userForSocketId.userName, playerState, timeInVideo)

            // Broadcast the 'pause' action to the party
            socketUtils.broadcastActionToParty(socket, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, {playerState:'paused', timeInVideo})
            // Send a message to the party, letting them know that a user paused the video
            party.sendMessageToParty(io, socket, playerStateChangeMessage, partyId, 'Server')
        }

        // If a user is playing the video/skipping to a new time in the video -> pause the video for
        // EVERYONE in the party at that exact timestamp. Then wait for everyone to be done with buffering
        // before sending the 'play' command to everyone in the party
        if(playerState === 'playing'){
            socketUtils.emitActionToParty(io, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, {playerState:'paused', timeInVideo})
            // Toggle 'waitingForReady' to 'true' so we know that this party is waiting for everyone to be ready
            party.toggleWaitingForPartyToBeReady(partyId, true)
        }
    }

    // If the party is currently waiting to be ready (waiting for everyone to be done with buffering)
    // AND everyone in the party is ready at this point -> send the play command to the entire party
    if(party.isWaitingToBeReady(partyId) && party.allUsersReady(partyId)){
        const videoPlayerForParty = party.getVideoPlayerForParty(partyId)
        const partyTimeInVideo = videoPlayerForParty.timeInVideo
        const actionInitiatingUser = videoPlayerForParty.lastStateChangeInitiator

        // Toggle 'waitingForReady' to 'false' so we know that this party is no longer waiting for everyone to be ready
        party.toggleWaitingForPartyToBeReady(partyId, false)

        // Start a new interval that keeps track of the time progression of the video in the party
        party.toggleVideoPlayerInterval(partyId, true)

        // Emit the 'play' command/action to everyone in the party
        socketUtils.emitActionToParty(io, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, {playerState:'playing', timeInVideo: partyTimeInVideo})

        // Let the party know who started playing the video
        if(actionInitiatingUser){
            // Generate a message to let the rest of the party know who started playing the video
            const userForSocketId = user.getUserForId(actionInitiatingUser)
            const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage(userForSocketId.userName, videoPlayerForParty.playerState, partyTimeInVideo)
            // Send a message to the party, letting them know who started playing the video
            party.sendMessageToParty(io, socket, playerStateChangeMessage, partyId, 'Server')
        }
    }
}