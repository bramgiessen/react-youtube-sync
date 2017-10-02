// Libs & utils
import { debounce, cloneDeep } from 'lodash'
import { cache, user } from './'
import { generalUtils, socketUtils, messageUtils } from '../utils'

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
		cache.parties.push ( {
			partyId,
			selectedVideo: videoDetails,
			videoPlayer: {
				playerState: 'paused',
				timeInVideo: 0,
				lastStateChangeInitiator: null
			},
			videoPlayerInterval: null,
			usersInParty: [],
			messagesInParty: [],
			waitingForReady: false
		} )

		return partyId
	},

	/**
	 * Returns true if party with given partyId already exists
	 * @param partyId
	 * @returns {Array|boolean}
	 */
	partyExists: ( partyId ) => {
		const partyIds = cache.parties.map ( activeParty => activeParty.partyId )
		return partyIds && partyIds.indexOf ( partyId ) !== -1
	},

	/**
	 * Get an active party by given partyId
	 * @param partyId
	 * @returns {*}
	 */
	getPartyById: ( partyId ) => {
		return cache.parties.find ( ( activeParty ) => activeParty.partyId && activeParty.partyId === partyId )
	},

	/**
	 * Toggle the 'waitingForReady' param of a party with given partyId
	 * When set to true, this means the party is waiting for all clients to be done with buffering
	 * @param partyId
	 * @param boolean
	 */
	toggleWaitingForPartyToBeReady: ( partyId, boolean ) => {
		const partyForId = party.getPartyById ( partyId )
		partyForId.waitingForReady = boolean
	},

	/**
	 * Returns true if the party with given partyId is waiting for all clients to be done with buffering
	 * @param partyId
	 * @returns {*}
	 */
	isWaitingToBeReady: ( partyId ) => {
		const partyForId = party.getPartyById ( partyId )
		return partyForId && partyForId.waitingForReady
	},

	/**
	 * Returns true if the newPlayerState is a valid playerState for the party
	 * ( the parties' playerState may only be 'playing' or 'paused' )
	 * @param newPlayerState
	 * @returns {boolean}
	 */
	isValidPlayerState: ( newPlayerState ) => {
		const validPlayerStates = [ 'playing', 'paused' ]
		return validPlayerStates.indexOf ( newPlayerState.playerState ) !== -1
	},

	/**
	 * Returns true if given newPlayerState is a valid change of playerState for the party
	 * ( A parties playerState may not go from 'playing' to 'paused' at the exact same timeInVideo,
	 *   as this is a default response from the clients' Youtube players' onStateChange event after the client
	 *   receives a 'playing' command )
	 * @param currentPlayerState
	 * @param newPlayerState
	 * @returns {boolean}
	 */
	isValidPlayerStateChange: ( currentPlayerState, newPlayerState ) => {
		const timeInVideoDiffers = currentPlayerState.timeInVideo !== newPlayerState.timeInVideo

		return !(currentPlayerState.playerState === 'playing'
		&& newPlayerState.playerState === 'paused'
		&& !timeInVideoDiffers)
	},

	/**
	 * Returns true is the given newPlayerState is to be considered different from the currentPlayerState
	 * this is the case when either the timeInVideo differs or if the playerState differs
	 * @param currentPlayerState
	 * @param newPlayerState
	 * @returns {boolean}
	 */
	isNewPlayerState: ( currentPlayerState, newPlayerState ) => {
		const timeInVideoDiffers = currentPlayerState.timeInVideo !== newPlayerState.timeInVideo
		const playerStateDiffers = currentPlayerState.playerState !== newPlayerState.playerState

		return timeInVideoDiffers || playerStateDiffers
	},

	/**
	 * Returns true if the given new playerState is a valid, new playerState for the party with given partyId
	 * and the party is currently not waiting for a previous stateChange to be completed
	 * @param partyId
	 * @param newPlayerState
	 * @returns {boolean}
	 */
	isValidNewPlayerStateForParty: ( partyId, newPlayerState ) => {
		const partyIsWaitingForPrevStateChange = party.isWaitingToBeReady ( partyId )
		const currentVideoPlayerForParty = party.getVideoPlayerForParty ( partyId )
		const isNewPlayerState = party.isNewPlayerState ( currentVideoPlayerForParty, newPlayerState )
		const isValidPlayerState = party.isValidPlayerState ( newPlayerState )
		const isValidStateChange = party.isValidPlayerStateChange ( currentVideoPlayerForParty, newPlayerState )

		return !partyIsWaitingForPrevStateChange
			&& isValidPlayerState
			&& isValidStateChange
			&& isNewPlayerState
	},

	/**
	 * Returns true if all users in a party have status 'paused' (instead of 'buffering')
	 * @param partyId
	 * @returns {boolean}
	 */
	allUsersReady: ( partyId ) => {
		const partyIsWaitingToBeReady = party.isWaitingToBeReady ( partyId )
		const usersInParty = party.getUsersForParty ( partyId )
		const usersThatAreReady = usersInParty.filter ( ( userInParty ) => {
			return userInParty.videoPlayerState.playerState === 'paused'
		} )

		return partyIsWaitingToBeReady
			&& usersInParty.length === usersThatAreReady.length
	},

	/**
	 * Get the selected video object for the party with given partyId
	 * @param partyId
	 * @returns {*}
	 */
	getSelectedVideoForParty: ( partyId ) => {
		const partyForId = party.getPartyById ( partyId )

		return partyForId && partyForId.selectedVideo ?
			partyForId.selectedVideo : {}
	},

	/**
	 * Get the videoPlayer object (containing i.e. the playerState) for a specific party
	 * @param partyId
	 * @returns {*}
	 */
	getVideoPlayerForParty: ( partyId ) => {
		const partyForId = party.getPartyById ( partyId )
		return partyForId && partyForId.videoPlayer
			? partyForId.videoPlayer
			: {}
	},

	/**
	 * Retrieve all users that are in a specific party
	 * @param partyId
	 * @returns {*}
	 */
	getUsersForParty: ( partyId ) => {
		const partyForId = party.getPartyById ( partyId )
		const userIdsInParty = partyForId ? partyForId.usersInParty : []

		const usersInParty = userIdsInParty.map ( ( userId ) => {
			return user.getUserForId ( userId )
		} )

		return usersInParty
	},

	/**
	 * Retrieve all messages that were posted inside a party
	 * @param partyId
	 * @returns {Array|*}
	 */
	getMessagesInParty: ( partyId ) => {
		const partyForId = cache.parties.find ( ( activeParty ) => activeParty.partyId === partyId )

		return partyForId.messagesInParty
	},

	/**
	 * Emit a message to a specific party
	 * @param io
	 * @param socket
	 * @param message
	 * @param partyId
	 * @param userName
	 */
	sendMessageToParty: ( io, message, partyId, userName ) => {
		// Read all messages in the party
		const messagesInCurrentParty = party.getMessagesInParty ( partyId )

		const messageWithUserName = { message, userName, partyId }

		// Add the message to the messagesInCurrentParty array
		messagesInCurrentParty.push ( messageWithUserName )

		// Emit all messages in the party to all clients in the party
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.PARTY_MESSAGE_RECEIVED, messagesInCurrentParty )
	},

	/**
	 * Toggle the videoPlayer interval that keeps track of the time progression of the video
	 * for the party
	 * @param partyId
	 * @param turnOn (false -> clear the interval | true -> start the interval)
	 */
	toggleVideoPlayerInterval: ( partyId, turnOn ) => {
		const partyForId = party.getPartyById ( partyId )
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )

		// Keep track of the time in the video while the video is playing
		if ( turnOn && !partyForId.videoPlayerInterval ) {
			if ( !partyForId.videoPlayerInterval ) {
				partyForId.videoPlayerInterval = setInterval ( () => {
					videoPlayerForParty.timeInVideo += 1
				}, 1000 )
			}
		} else if ( partyForId.videoPlayerInterval ) {
			clearInterval ( partyForId.videoPlayerInterval )
			partyForId.videoPlayerInterval = null
		}
	},

	/**
	 * Start playing the video for all clients in a party
	 * @param io
	 * @param partyId
	 */
	playVideoForParty: ( io, partyId ) => {
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )
		const actionInitiatingUser = videoPlayerForParty.lastStateChangeInitiator

		// Start a new interval that keeps track of the time progression of the video in the party
		party.toggleVideoPlayerInterval ( partyId, true )

		// Emit the 'play' command/action to everyone in the party
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, {
			playerState: 'playing',
			timeInVideo: videoPlayerForParty.timeInVideo
		} )

		// Let the party know who started playing the video
		if ( actionInitiatingUser ) {
			// Generate a message to let the rest of the party know who started playing the video
			const userForSocketId = user.getUserForId ( actionInitiatingUser )
			const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage ( userForSocketId.userName, videoPlayerForParty )
			// Send a message to the party, letting them know who started playing the video
			party.sendMessageToParty ( io, playerStateChangeMessage, partyId, 'Server' )
		}
	},

	/**
	 * Pause the videoPlayer for all clients in a party with the option to exclude the
	 * client that initiated the pause action for the party (as his videoPlayer will already be paused)
	 * @param io
	 * @param socket
	 * @param partyId
	 * @param videoPlayerState
	 * @param includeInitiatingUser
	 */
	pauseVideoForParty: ( io, socket, partyId, videoPlayerState, includeInitiatingUser ) => {
		const userForId = user.getUserForId ( socket.id )
		const pausedVideoPlayerState = {
			playerState: 'paused',
			timeInVideo: videoPlayerState.timeInVideo
		}

		// Generate a message to let other users know who paused the video
		const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage ( userForId.userName, pausedVideoPlayerState )

		if ( !includeInitiatingUser ) {
			// Broadcast the 'pause' action to everyone in the party except the action initiator
			socketUtils.broadcastActionToParty ( socket, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, pausedVideoPlayerState )

			// Send a message to the party, letting them know that a user paused the video
			party.sendMessageToParty ( io, playerStateChangeMessage, partyId, 'Server' )
		} else {
			// Emit the 'pause' action to everyone in the party
			socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.SET_PARTY_PLAYER_STATE, pausedVideoPlayerState )
		}
	},

	/**
	 * Event handler for when the videoPlayer state for a party changes
	 * @param io
	 * @param socket
	 * @param partyId
	 * @param newPlayerState
	 */
	onNewPlayerStateForParty: ( io, socket, partyId, newPlayerState ) => {
		const partyForId = party.getPartyById ( partyId )

		// Clear the current videoPlayer interval for this party
		party.toggleVideoPlayerInterval ( partyId, false )

		// Set the new videoPlayer state in the party object
		partyForId.videoPlayer = newPlayerState

		// If the parties' videoPlayer state is being changed to playing -> start waiting for all
		// clients to be done with buffering
		if ( newPlayerState.playerState === 'playing' ) {
			// Toggle 'waitingForReady' to 'true' so we know that this party is waiting for everyone to be ready
			party.toggleWaitingForPartyToBeReady ( partyId, true )

			// Pause the video for everyone in the party until all clients are done buffering
			party.pauseVideoForParty ( io, socket, partyId, newPlayerState, true )
		} else {
			// Someone just paused the video -> pause the video for all clients except
			// the client that initiated the pause action as his videoPlayer is already paused
			party.pauseVideoForParty ( io, socket, partyId, newPlayerState, false )
		}

	}
}