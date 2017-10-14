import { cache } from './index'
import { party } from "./party"

// Utils & libs
import { socketUtils } from '../utils'

// Constants
import { ACTION_TYPES } from '../core/constants'

export const user = {

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
	 * Returns true if a user with given socketId exists in the activeUsers array
	 * @param socketId
	 * @returns {*}
	 */
	userExists: ( socketId ) => {
		return !!user.getUserForId ( socketId )
	},

	/**
	 * Create a new user if a user with the given socketId doesn't already exist
	 * @param socket
	 * @param userName
	 */
	createNewUser: ( userId, userName ) => {
		// If a user with the socketId doesn't exist yet -> create
		// a new user and add him to the activeUsers array
		if ( !user.userExists ( userId ) ) {
			const newUser = {
				socketId: userId,
				userName,
				readyToPlayState: {
					clientIsReady: false,
					timeInVideo: 0
				}
			}
			cache.users.push ( newUser )
		}
	},

	updateUserNameForUser: (userId, userName) => {
		if ( user.userExists ( userId ) ) {
			const userForId = user.getUserForId(userId)
			userForId.userName = userName
		}
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
	 * Returns true is user is authenticated
	 * (right now there is a VERY simple mechanism to determine if a user is authenticated:
	 * if he/she simply has a username: he/she is authenticated, as that's all we require
	 * at this point for this simple demo/P.O.C.)
	 * @param socketId
	 */
	isUserAuthenticated: ( socketId ) => {
		const userForId = user.getUserForId ( socketId )

		return !!(userForId && userForId.userName)
	},

	/**
	 * Retrieve all the party ids from all parties a user ( referenced by socketId ) is currently in
	 * @param socketId
	 * @returns {Array}
	 */
	getPartyIdForUser: ( socketId ) => {
		const partyIdsForUser = cache.parties.filter ( ( activeParty ) => {
			return activeParty.usersInParty.find ( ( userId ) => userId === socketId )
		} ).map ( ( activeParty ) => activeParty.partyId )

		return partyIdsForUser && partyIdsForUser.length ? partyIdsForUser[ 0 ] : null
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
	 * Remove a user from the party he is in,
	 * making sure he isn't accidentally stuck in any parties at all
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
	 * 1. Removes a user from all parties it is currently in
	 * 2. Notifies all other clients in these parties that the user has been disconnected
	 * @param io
	 * @param socket
	 */
	disconnectFromParty: ( io, socket ) => {
		const userId = socket.id
		const partyIdForUser = user.getPartyIdForUser ( userId )
		user.removeUserFromParties ( io, socket )

		// Notify all users still in the party that this user has left the party
		if ( partyIdForUser ) {
			const usersStillInParty = party.getUsersForParty ( partyIdForUser )
			socketUtils.emitActionToParty ( io, partyIdForUser, ACTION_TYPES.SET_USERS_IN_PARTY, usersStillInParty )
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

	/**
	 * Reset the selected video for a user
	 * @param socket
	 */
	resetSelectedVideoForUser: ( socket ) => {
		socketUtils.emitActionToClient ( socket, ACTION_TYPES.SET_SELECTED_VIDEO, {
			id: '',
			title: '',
			description: '',
			thumbnailSrc: '',
			videoSource: ''
		} )
	},

	/**
	 * Reset both the playerState and the selected video for a user
	 * @param socket
	 */
	resetClientToInitialState: ( socket ) => {
		user.resetPlayerStateForUser ( socket )
		user.resetSelectedVideoForUser ( socket )
	},

	/**
	 * Set / save the videoPlayers' state of a user
	 * ( We do this so we know if the user is ready to play, or i.e. still buffering a video )
	 * @param socketId
	 * @param newReadyToPlayState
	 * @returns {boolean}
	 */
	setUserReadyToPlayState: ( socketId, newReadyToPlayState ) => {
		const userForId = user.getUserForId ( socketId )
		if ( !userForId ) {
			return false
		}

		userForId.readyToPlayState = newReadyToPlayState
	}
}