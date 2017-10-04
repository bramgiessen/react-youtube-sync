import { cache } from './index'
import { party } from "./party"

// Utils & libs
import { socketUtils } from '../utils'

// Constants
import { ACTION_TYPES } from '../core/constants'

export const user = {

	/**
	 * Create a new user if a user with the given socketId doesn't already exist
	 * @param socket
	 * @param userName
	 */
	createNewUser: ( socket, userName ) => {
		const socketId = socket.id

		// If a user with the socketId doesn't exist yet -> create
		// a new user and add him to the activeUsers array
		if ( !user.userExists ( socketId ) ) {
			const newUser = {
				socketId,
				userName,
				readyToPlayState: {
					clientIsReady: false,
					timeInVideo: 0
				}
			}
			cache.users.push ( newUser )
		}
	},

	/**
	 * Returns true if a user with given socketId exists in the activeUsers array
	 * @param socketId
	 * @returns {*}
	 */
	userExists: ( socketId ) => {
		return !!user.getUserForId ( socketId )
	},

	/**
	 * Returns the user that belongs to the specified socketId
	 * ( returns undefined if user doesn't exist )
	 * @param socketId
	 * @returns {*}
	 */
	getUserForId: ( socketId ) => {
		return cache.users.find ( ( activeUser ) => activeUser.socketId === socketId )
	},

	/**
	 * Returns the videoPlayerState for a user
	 * @param socketId
	 * @returns {null}
	 */
	getVideoPlayerForUser: ( socketId ) => {
		const userForId = user.getUserForId ( socketId )

		return userForId && userForId.videoPlayerState ? userForId.videoPlayerState : null
	},

	/**
	 * Returns true is user is authenticated
	 * (right now there is a VERY simple mechanism to determine if a user is authenticated:
	 * if he/she simply has a username: he/she is authenticated, as that's all we require
	 * at this point for this simple demo/P.O.C.)
	 * @param socketId
	 */
	isUserAuthenticated: ( socketId ) => {
		const userForId = user.getUserForId ( socketId )

		return userForId && userForId.userName
	},

	/**
	 * Retrieve all the party ids from all parties a user ( referenced by socketId ) is currently in
	 * @param socketId
	 * @returns {Array}
	 */
	getPartyIdsForUser: ( socketId ) => {
		return cache.parties.filter ( ( activeParty ) => {
			return activeParty.usersInParty.find ( ( userId ) => userId === socketId )
		} ).map ( ( activeParty ) => activeParty.partyId )
	},

	/**
	 * Returns true if given user is in a party with given partyId
	 * @param user
	 * @param partyId
	 * @returns {*|Array|boolean}
	 */
	isUserInParty: ( socketId, partyId ) => {
		const partyIdsForUser = user.getPartyIdsForUser ( socketId )

		return partyIdsForUser && (partyIdsForUser.indexOf ( partyId ) !== -1)
	},

	/**
	 * Returns true if the given user is a member of the given party and is authenticated (has a userName)
	 * @param socketId
	 * @param partyId
	 * @returns {*|Array|boolean}
	 */
	isAuthorizedInParty: ( socketId, partyId ) => {
		return user.isUserInParty ( socketId, partyId ) && user.isUserAuthenticated ( socketId )
	},

	/**
	 * Make given socket/user leave all socketIo managed rooms it is currently in
	 * @param io
	 * @param socket
	 */
	leaveSocketIoRooms: ( io, socket ) => {
		const roomsForSocket = io.sockets.adapter.sids[ socket.id ]
		for ( const room in roomsForSocket ) {
			socket.leave ( room )
		}
	},

	/**
	 * Remove a user from all parties it is currently in
	 * @param io
	 * @param socket
	 */
	removeUserFromParties: ( io, socket ) => {
		const socketId = socket.id

		// Make sure the user isn't in any server managed parties anymore
		cache.parties.forEach ( ( activeParty ) => {
			activeParty.usersInParty = activeParty.usersInParty.filter ( ( userId ) => {
				return userId !== socketId
			} )
		} )

		// Disconnect the socket from the parties / rooms managed by socketIo
		user.leaveSocketIoRooms ( io, socket )
	},

	/**
	 * Add a user to a specific party
	 * @param io
	 * @param socket
	 * @param partyId
	 */
	addUserToParty: ( io, socket, partyId ) => {
		const partyForId = party.getPartyById ( partyId )
		const socketId = socket.id

		// Make sure the user isn't in any other parties anymore
		user.removeUserFromParties ( io, socket )

		// Add the users' socketId to the selected party
		partyForId.usersInParty.push ( socketId )

		// Connect the user to the party room through socketIo's native room implementation
		socket.join ( partyId )
	},

	/**
	 * 1. Removes a user from all parties it is currently in
	 * 2. Notifies all other clients in these parties that the user has been disconnected
	 * @param io
	 * @param socket
	 */
	disconnectFromParty: ( io, socket ) => {
		const currentPartyIds = user.getPartyIdsForUser ( socket.id )
		user.removeUserFromParties ( io, socket )

		// user was still in parties, remove him from these parties
		if ( currentPartyIds ) {
			currentPartyIds.forEach ( ( partyId ) => {
				const usersStillInParty = party.getUsersForParty ( partyId )
				io.sockets.in ( partyId ).emit ( 'action', { type: 'SET_USERS_IN_PARTY', payload: usersStillInParty } )
			} )
		}
	},

	/**
	 * Reset the playerState for a user
	 * @param socket
	 */
	resetPlayerStateForUser: ( socket ) => {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_CLIENT_PLAYER_STATE, {
			playerState: 'paused',
			timeInVideo: 0
		} )
	},

	resetSelectedVideoForUser: ( socket ) => {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_SELECTED_VIDEO, {
			id: '',
			title: '',
			description: '',
			thumbnailSrc: '',
			videoSource: ''
		} )
	},

	resetClientToInitialState: ( socket ) => {
		user.resetPlayerStateForUser ( socket )
		user.resetSelectedVideoForUser( socket )
	},

	/**
	 * Set / save the videoPlayers' state of a user
	 * ( We do this so we know if the user is ready to play, or i.e. still buffering a video )
	 * @param socketId
	 * @param videoPlayerState
	 * @returns {boolean}
	 */
	setUserReadyToPlayState: ( socketId, newReadyToPlayState ) => {
		const userForId = user.getUserForId ( socketId )
		if ( !userForId ) {
			return false
		}

		userForId.readyToPlayState = newReadyToPlayState
	},

	/**
	 * Reset the playerState for a user back to it's initial value
	 * @param userId
	 */
	resetReadyToPlayState: ( userId ) => {
		const userForId = user.getUserForId ( userId )

		userForId.readyToPlayState = {
			clientIsReady: false,
			timeInVideo: 0
		}
	},

	isInSyncWithParty: ( userId, partyId ) => {
		const videoPlayerStateForUser = user.getVideoPlayerForUser ( userId )
		const videoPlayerStateForParty = party.getVideoPlayerForParty ( partyId )
		if ( !videoPlayerStateForParty || !videoPlayerStateForUser ) {
			return false
		}

		console.log ( videoPlayerStateForParty.timeInVideo, videoPlayerStateForUser.timeInVideo )

		return videoPlayerStateForParty.playerState === videoPlayerStateForUser.playerState
			&& videoPlayerStateForParty.timeInVideo === videoPlayerStateForUser.timeInVideo
	}

}