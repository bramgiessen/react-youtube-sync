// Libs & utils
import { cache, user } from './'
import { generalUtils, socketUtils, messageUtils } from '../utils'

// Constants
import { ACTION_TYPES, serverUserName } from '../core/constants'

export const party = {

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
			waitingForAllUsersToBeReady: false,
			videoPlayer: {
				playerState: 'paused',
				timeInVideo: 0,
				lastStateChangeInitiator: null
			},
			videoPlayerInterval: null,
			usersInParty: [],
			messagesInParty: [],
		} )

		return partyId
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

		return partyForId && partyForId.messagesInParty ? partyForId.messagesInParty : []
	},

	/**
	 * Send all details of a party to a specified client
	 * @param socket
	 * @param partyId
	 * @returns {boolean}
	 */
	sendPartyDetailsToClient: ( socket, partyId ) => {
		if ( !party.partyExists ( partyId ) ) {
			return false
		}

		// Gather the selected video details for the party
		const videoForParty = party.getSelectedVideoForParty ( partyId )
		// Get the current Video player state for the party
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )
		const usersInParty = party.getUsersForParty ( partyId )
		const messagesInParty = party.getMessagesInParty ( partyId )

		// Let the client know which video is selected in the party:
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_SELECTED_VIDEO, videoForParty )

		// Let the client know what the current playerState is in the party ('playing', 'paused' etc.)
		if ( videoPlayerForParty.timeInVideo !== 0 ) {
			socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_CLIENT_PLAYER_STATE, videoPlayerForParty )
		}

		// Let the client know which other users are currently connected to the party
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_USERS_IN_PARTY, usersInParty )

		// Send all messages that have been posted in the party to the client
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.PARTY_MESSAGE_RECEIVED, messagesInParty )
	},

	/**
	 * Notify all clients in a party of a newly connected user
	 * @param io
	 * @param partyId
	 * @param userName
	 */
	notifyPartyOfNewlyJoinedUser: ( io, partyId, userName ) => {
		const usersInParty = party.getUsersForParty ( partyId )

		// Gather all messages that have previously been posted in the party
		// and add a new message to let everybody know that a new user just joined the party
		const messagesInParty = party.getMessagesInParty ( partyId )
		// Create a new message to let everybody know that a new user just joined the party
		const userJoinedMessage = messageUtils.generateUserJoinedMessage ( userName, partyId, serverUserName )
		messagesInParty.push ( userJoinedMessage )

		// Let the client know which other users are currently connected to the party
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.SET_USERS_IN_PARTY, usersInParty )

		// Resend all messages that have been posted in the party to all clients in the party
		// todo: optimize by sending ONLY NEW messages to already connected users instead of resending ALL messages
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.PARTY_MESSAGE_RECEIVED, messagesInParty )
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
	 * for a party
	 * @param partyId
	 * @param turnOn (false -> clear the interval | true -> start the interval)
	 */
	toggleVideoPlayerInterval: ( partyId, turnOn ) => {
		const partyForId = party.getPartyById ( partyId )
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )

		// Start keeping track of the time in the video while the video is playing
		if ( turnOn && !partyForId.videoPlayerInterval ) {
			if ( !partyForId.videoPlayerInterval ) {
				partyForId.videoPlayerInterval = setInterval ( () => {
					videoPlayerForParty.timeInVideo += 1
				}, 1000 )
			}
		} else if ( partyForId.videoPlayerInterval ) {
			// Clear the interval that keeps track of the time progression for this party
			clearInterval ( partyForId.videoPlayerInterval )
			partyForId.videoPlayerInterval = null
		}
	},

	/**
	 * Start playing the video for all clients in a party
	 *
	 * @param io
	 * @param partyId
	 */
	playVideoForParty: ( io, partyId ) => {
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )

		// Start a new interval that keeps track of the time progression of the video in the party
		party.toggleVideoPlayerInterval ( partyId, true )

		// Emit the 'play' command/action to everyone in the party
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.SET_CLIENT_PLAYER_STATE, {
			playerState: 'playing',
			timeInVideo: videoPlayerForParty.timeInVideo
		} )
	},

	/**
	 * Pause the videoPlayer for all clients in a party with the option to exclude the
	 * client that initiated the pause action for the party (as his videoPlayer will already be paused)
	 *
	 * @param io
	 * @param partyId
	 * @param videoPlayerState
	 */
	pauseVideoForParty: ( io, partyId, videoPlayerState ) => {
		// Stop the videoInterval
		party.toggleVideoPlayerInterval ( partyId, false )

		// Emit the 'pause' action to everyone in the party
		socketUtils.emitActionToParty ( io, partyId, ACTION_TYPES.SET_CLIENT_PLAYER_STATE, {
			playerState: 'paused',
			timeInVideo: videoPlayerState.timeInVideo
		} )
	},

	/**
	 * Emit a message to the party to notify all users in the party that the video is now playing
	 * @param io
	 * @param socket
	 * @param partyId
	 */
	emitVideoPlayingMessageToParty: ( io, socket, partyId ) => {
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )
		const actionInitiatingUser = videoPlayerForParty.lastStateChangeInitiator

		// Let the party know who started playing the video
		if ( actionInitiatingUser ) {
			// Generate a message to let the rest of the party know who started playing the video
			const userForSocketId = user.getUserForId ( actionInitiatingUser )
			const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage ( userForSocketId.userName, videoPlayerForParty )
			// Send a message to the party, letting them know that a user started playing the video
			party.sendMessageToParty ( io, playerStateChangeMessage, partyId, serverUserName )
		}
	},

	/**
	 * Emit a message to the party to notify all users in the party that the video is now paused
	 * @param io
	 * @param socket
	 * @param partyId
	 */
	emitVideoPausedMessageToParty: ( io, socket, partyId ) => {
		const videoPlayerForParty = party.getVideoPlayerForParty ( partyId )
		const userForId = user.getUserForId ( socket.id )
		// Generate a message to let other users know who paused the video
		const playerStateChangeMessage = messageUtils.generatePlayerStateChangeMessage ( userForId.userName, videoPlayerForParty )

		// Send a message to the party, letting them know that a user paused the video
		party.sendMessageToParty ( io, playerStateChangeMessage, partyId, serverUserName )
	},

	/**
	 * Remember if the party is currently waiting for all users to be ready to play
	 * and notify all users in the party if the party is waiting or ready to play
	 * @param io
	 * @param partyId
	 * @param isNowWaitingForAllUsersToBeReady
	 */
	togglePartyWaitingToBeReady: ( io, partyId, isNowWaitingForAllUsersToBeReady ) => {
		const partyForId = party.getPartyById ( partyId )
		const currentlyWaitingToBeReady = partyForId.waitingForAllUsersToBeReady

		// If the party was previously waiting to be ready and is now ready
		if ( currentlyWaitingToBeReady && !isNowWaitingForAllUsersToBeReady ) {
			party.sendMessageToParty ( io, 'Everybody is done with buffering !', partyId, serverUserName )
		}
		// If the party was not previously waiting to be ready but now IS waiting for some users to be ready to play
		else if ( !currentlyWaitingToBeReady && isNowWaitingForAllUsersToBeReady ) {
			party.sendMessageToParty ( io, 'Waiting for everyone to be done with buffering ..', partyId, serverUserName )
		}

		partyForId.waitingForAllUsersToBeReady = isNowWaitingForAllUsersToBeReady
	},

	/**
	 * Returns true if all users in a party are ready to play the video (thus are done 'buffering')
	 * @param partyId
	 * @returns {boolean}
	 */
	allUsersReady: ( partyId ) => {
		const usersInParty = party.getUsersForParty ( partyId )

		const usersThatAreReady = usersInParty.filter ( ( userInParty ) => {
			return userInParty.readyToPlayState.clientIsReady
		} )

		return usersInParty.length === usersThatAreReady.length
	},

	/**
	 * Handle the event where a user reports not to be ready to play
	 * -> pause the video for everyone in the party
	 * @param io
	 * @param userId
	 * @param partyIdForUser
	 */
	handleUserInPartyNotReady: ( io, userId, partyIdForUser ) => {
		const userForId = user.getUserForId ( userId )
		const readyToPlayStateForUser = userForId.readyToPlayState
		// If the videoPlayer for the client is still at 0 seconds
		// -> this userReadyState is the initial ready state for this user
		const isInitialReadyStateForClient = readyToPlayStateForUser.timeInVideo === 0

		// Only pause the video if this isn't the initial readyToPlayState for the client
		// as the video was still paused/unstarted at this point ( triggering a playerState change
		// at this point would trigger a Youtube infinite buffering bug )
		if ( !isInitialReadyStateForClient ) {
			party.pauseVideoForParty ( io, partyIdForUser, readyToPlayStateForUser )
			party.togglePartyWaitingToBeReady ( io, partyIdForUser, true )
		} else if ( isInitialReadyStateForClient ) {
			// Stop the videoInterval
			party.toggleVideoPlayerInterval ( partyIdForUser, false )
		}
	},

	/**
	 * When all users in a party are ready to play -> play the video for the party
	 * @param io
	 * @param partyId
	 */
	handleAllUsersInPartyReady: ( io, partyId ) => {
		const partyForId = party.getPartyById ( partyId )
		const currentPlayerStateForParty = partyForId.videoPlayer.playerState

		if ( currentPlayerStateForParty === 'playing' ) {
			party.playVideoForParty ( io, partyId )
			party.togglePartyWaitingToBeReady ( io, partyId, false )
		}
	},

	/**
	 * Event handler for when a user tries to change the videoPlayer state for a party
	 * @param io
	 * @param socket
	 * @param partyId
	 * @param newPlayerState
	 */
	onNewPlayerStateForParty: ( io, socket, partyId, newPlayerState ) => {
		const partyForId = party.getPartyById ( partyId )

		// Clear the current videoPlayer interval for this party
		party.toggleVideoPlayerInterval ( partyId, false )

		const newVideoPlayerStateForParty = {
			lastStateChangeInitiator: socket.id,
			playerState: newPlayerState.playerState,
			timeInVideo: newPlayerState.timeInVideo
		}

		// Set the new videoPlayer state in the party object
		partyForId.videoPlayer = newVideoPlayerStateForParty

		// Play / pause the video for all users in the party
		if ( newPlayerState.playerState === 'playing' ) {
			party.playVideoForParty ( io, partyId )
			party.emitVideoPlayingMessageToParty ( io, socket, partyId )
		} else {
			party.pauseVideoForParty ( io, partyId, newVideoPlayerStateForParty )
			party.emitVideoPausedMessageToParty ( io, socket, partyId )
		}
	}
}