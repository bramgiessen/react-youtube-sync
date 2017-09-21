// Libs & utils
import { debounce, cloneDeep } from 'lodash'
import { cache, user } from './'
import { generalUtils, socketUtils } from '../utils'

// Constants
import { ACTION_TYPES } from '../core/constants'

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
		const videoPlayerForParty = partyForId && partyForId.videoPlayer
			? cloneDeep(partyForId.videoPlayer)
			: {}

        return videoPlayerForParty
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

		// Emit all messages in the party to all clients in the party
        socketUtils.emitActionToParty(io, partyId, ACTION_TYPES.PARTY_MESSAGE_RECEIVED, messagesInCurrentParty)
	},

    /**
	 * Toggle the videoPlayer interval that keeps track of the time in the video
	 * for the party based on the given playerState
     * @param playerState ('paused' -> clear the interval | 'playing' -> start the interval)
     * @param partyId
     */
	toggleVideoPlayerInterval: (playerState, partyId) => {
        const partyForId = party.getPartyById( partyId )
        const videoPlayerForParty = party.getVideoPlayerForParty(partyId)

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
	},

    /**
	 * Update the videoPlayerState of a party ( to paused/playing )
     */
	setPlayerState: debounce(( io, socket, playerState, timeInVideo, partyId, callback ) => {
        const partyForId = party.getPartyById( partyId )
        const videoPlayerForParty = party.getVideoPlayerForParty(partyId)

		// If the playerState has been changed to 'playing' or 'paused' -> let all clients in the party know
		if ( playerState === 'playing' || playerState === 'paused' ) {
            videoPlayerForParty.playerState = playerState
            videoPlayerForParty.timeInVideo = timeInVideo
		}

		// Toggle the videoPlayer interval that keeps track of the time in the video
		// for the party
		party.toggleVideoPlayerInterval()

		// Set the new videoPlayer state in the party object
		partyForId.videoPlayer = videoPlayerForParty

        callback()
	}, 500)
}