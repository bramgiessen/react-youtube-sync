// Libs & utils
import { generalUtils } from '../utils/index'
import { debounce } from 'lodash'
import { cache } from './index'
import {user} from "./user";

export const party = {

    /**
	 * Create a new party and set the selected video details for the party
     * @param io
     * @param socket
     * @param videoDetails
     * @returns {*|string}
     */
	createParty: ( io, socket, videoDetails ) => {

		// Generate unique partyId
		let partyId = generalUtils.generateId ()
		while ( party.partyExists ( partyId ) ) {
			partyId = generalUtils.generateId ()
		}

		// Add a new party with the generated partyId to the parties array
        cache.parties.push({
			partyId,
            selectedVideo: videoDetails,
			videoPlayer: {
				playerState: 'paused',
				timeInVideo: 0
			},
            videoPlayerInterval: null,
            usersInParty:[],
            messagesInParty:[]
		})

		return partyId
	},

    /**
	 * Returns true if party with given partyId already exists
     * @param partyId
     * @returns {Array|boolean}
     */
	partyExists: ( partyId ) => {
		const partyIds = cache.parties.map(activeParty => activeParty.partyId)
		return partyIds && partyIds.indexOf ( partyId ) !== -1
	},

    /**
	 * Get an active party by given partyId
     * @param partyId
     * @returns {*}
     */
	getPartyById: (partyId) => {
		return  cache.parties.find((activeParty) => activeParty.partyId && activeParty.partyId === partyId)
	},

    /**
	 * Get the selected video object for the party with given partyId
     * @param partyId
     * @returns {*}
     */
	getSelectedVideoForParty: ( partyId ) => {
        const partyForId = party.getPartyById(partyId)

		return partyForId && partyForId.selectedVideo ?
            partyForId.selectedVideo : {}
	},

    /**
	 * Get the videoPlayer object (containing i.e. the playerState) for a specific party
     * @param partyId
     * @returns {*}
     */
    getVideoPlayerForParty: ( partyId ) => {
        const partyForId = party.getPartyById(partyId)

        return partyForId && partyForId.videoPlayer ?
            partyForId.videoPlayer : {}
    },

    /**
	 * Retrieve all users that are in a specific party
     * @param partyId
     * @returns {*}
     */
	getUsersForParty: ( partyId ) => {
		const partyForId = party.getPartyById(partyId)
		const userIdsInParty = partyForId ? partyForId.usersInParty : null

		const usersInParty = userIdsInParty.map((userId) => {
			return user.getUserForId(userId)
		})

		return usersInParty
	},

    /**
	 * Retrieve all messages that were posted inside a party
     * @param partyId
     * @returns {Array|*}
     */
	getMessagesInParty: ( partyId ) => {
        const partyForId = cache.parties.find((activeParty) => activeParty.partyId === partyId)

		return partyForId.messagesInParty
	},

    /**
	 * Generate a message to let other users know that a new user joined the party
     * @param userName
     * @param partyId
     * @returns {{message: string, userName: string, partyId: *}}
     */
	generateUserJoinedMessage: (userName, partyId) => {
		return {message: `${userName} joined the party`, userName: 'Server', partyId}
	},

    /**
	 * Generate a message to let other users know that a user skipped / paused / plays a video
     * @param socketId
     * @param playerState
     * @param timeInVideo
     * @returns {string}
     */
	generatePlayerStateChangeMessage: (socketId, playerState, timeInVideo) => {
        const userForSocketId = user.getUserForId(socketId)
		const formattedTimeInVideo = generalUtils.toHHMMSS(timeInVideo)
		let playerStateChangeMessage = ''

		switch (playerState) {
			case 'paused':
                playerStateChangeMessage = `${userForSocketId.userName} paused the video`
				break;
			case 'playing':
                playerStateChangeMessage = `${userForSocketId.userName} started playing the video at ${formattedTimeInVideo}`
				break;
		}
		return playerStateChangeMessage
	},

    /**
	 * Broadcast a message to a specific party
     * @param io
     * @param socket
     * @param message
     * @param partyId
     * @param userName
     */
	sendMessageToParty: ( io, socket, message, partyId, userName ) => {
		// Read all messages in the party
		const messagesInCurrentParty = party.getMessagesInParty ( partyId )

		const messageWithUserName = { message, userName, partyId }

		// Add the message to the messagesInCurrentParty array
		messagesInCurrentParty.push ( messageWithUserName )

		io.to ( partyId ).emit ( 'action', { type: 'PARTY_MESSAGE_RECEIVED', payload: messagesInCurrentParty } )
	},

	setPlayerState: debounce(( io, socket, payload, playerState, timeInVideo, partyId ) => {
		// If the user is not in the party he is trying to set the playerState for
		// or has no userName (and thus is not authenticated) -> abort!
		if(!user.isAuthorizedInParty(socket.id, partyId)){
			return false
		}

        const partyForId = party.getPartyById(partyId)
        const videoPlayerForParty = party.getVideoPlayerForParty(partyId)
		const playerStateChangeMessage = party.generatePlayerStateChangeMessage(socket.id, playerState, timeInVideo)

		// If the playerState has been changed to 'playing' or 'paused' -> let all clients in the party know
		if ( playerState === 'playing' || playerState === 'paused' ) {
            videoPlayerForParty.playerState = playerState
            videoPlayerForParty.timeInVideo = timeInVideo
			socket.broadcast.to ( partyId ).emit ( 'action', { type: 'SET_PARTY_PLAYER_STATE', payload: videoPlayerForParty } )
			party.sendMessageToParty(io, socket, playerStateChangeMessage, partyId, 'Server')
		}

		// Keep track of the time in the video while the video is playing
		if(playerState === 'playing') {
			if(!partyForId.videoPlayerInterval){
                partyForId.videoPlayerInterval = setInterval(() => {
                    videoPlayerForParty.timeInVideo += 1
                }, 1000)
			}
		} else if ((playerState === 'paused' || playerState === 'ended') && partyForId.videoPlayerInterval) {
			clearInterval(partyForId.videoPlayerInterval)
            partyForId.videoPlayerInterval = null
		}

	}, 500)
}