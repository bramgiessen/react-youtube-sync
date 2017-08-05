// Libs & utils
import appCache from '../cache'
import { generalUtils, cacheUtils } from '../utils/index'
import { debounce } from 'lodash'

export const party = {
	cacheKeys: {
		partyIds: 'partyIds',
		videosForParties: 'videosForParties',
		usersInParties: 'usersInParties',
		messagesInParties: 'messagesInParties',
	},

	createParty: ( io, socket ) => {
		// Generate unique partyId
		let partyId = generalUtils.generateId ()
		while ( party.partyExists ( partyId ) ) {
			partyId = generalUtils.generateId ()
		}
		cacheUtils.addToArrayInCache ( partyId, party.cacheKeys.partyIds, false )

		// Make sure the user left all old parties before joining any new ones
		party.leaveParty ( io, socket )

		// Join the new party
		socket.join ( partyId )

		return partyId
	},

	leaveParty: ( io, socket ) => {
		const currentParties = io.sockets.adapter.sids[ socket.id ]
		for ( var party in currentParties ) {
			socket.leave ( party )
		}
	},

	partyExists: ( partyId ) => {
		const parties = appCache.get ( party.cacheKeys.partyIds )
		return parties && parties.indexOf ( partyId ) !== -1
	},

	setVideoForParty: ( io, socket, videoDetails ) => {
		const currentPartyId = Object.keys ( io.sockets.adapter.sids[ socket.id ] )[ 0 ]
		const currentVideosForParties = appCache.get ( party.cacheKeys.videosForParties )

		// Make sure we don't already have a video for this party set in our cache
		const filteredVideosForParties = currentVideosForParties
			? currentVideosForParties.filter ( videoForParty => videoForParty.partyId
			!== currentPartyId ) : []

		const videoForParty = { partyId: currentPartyId, videoDetails }

		// Add the video for this party to the filteredVideosForParties array
		filteredVideosForParties.push ( videoForParty )

		// Set the videosForParties in cache
		appCache.set ( party.cacheKeys.videosForParties, filteredVideosForParties )
	},

	getVideoForParty: ( partyId ) => {
		const currentVideosForParties = appCache.get ( party.cacheKeys.videosForParties )
		return currentVideosForParties ? currentVideosForParties.find ( ( videoForParty ) => {
				return videoForParty.partyId === partyId
			} ) : []
	},

	addUserToParty: ( io, socket, partyId, userName ) => {
		const socketId = socket.id

		// Read all users and in which parties they currently reside
		const currentUsersInParties = appCache.get ( party.cacheKeys.usersInParties )

		// Make sure we don't have the user in another party as well
		const filteredUsersInParties = currentUsersInParties
			? currentUsersInParties.filter ( userInParty => userInParty.socketId
			!== socketId ) : []

		const userInParty = { socketId, partyId, userName }

		// Add the user the filteredUsersInParties array
		filteredUsersInParties.push ( userInParty )

		// Connect to the new party
		socket.join ( partyId )

		// Set the usersInParties in cache
		appCache.set ( party.cacheKeys.usersInParties, filteredUsersInParties )
	},

	removeUserFromParty: ( io, socket ) => {
		const socketId = socket.id

		// Read all users and in which parties they currently reside
		const currentUsersInParties = appCache.get ( party.cacheKeys.usersInParties )

		// Make sure we don't have the user in another party as well
		const filteredUsersInParties = currentUsersInParties
			? currentUsersInParties.filter ( userInParty => userInParty.socketId
			!== socketId ) : []

		// Disconnect the socket from the party / room
		const currentParties = io.sockets.adapter.sids[ socket.id ]
		for ( let party in currentParties ) {
			socket.leave ( party )
		}

		// Set the videosForParties in cache
		appCache.set ( party.cacheKeys.usersInParties, filteredUsersInParties )
	},

	getUsersForParty: ( partyId ) => {
		const currentUsersInParties = appCache.get ( party.cacheKeys.usersInParties )
		return currentUsersInParties ? currentUsersInParties.filter ( ( userInParty ) => {
				return userInParty.partyId === partyId
			} ) : []
	},

	getPartyIdsForUser: ( socketId ) => {
		const currentUsersInParties = appCache.get ( party.cacheKeys.usersInParties )

		return currentUsersInParties ? currentUsersInParties.filter ( ( userInParty ) => {
				return userInParty.socketId === socketId
			} ).map ( ( userInParty ) => {
				return userInParty.partyId
			} ) : []
	},

	disconnectFromParty: ( io, socket ) => {
		const currentPartyIds = party.getPartyIdsForUser ( socket.id )
		party.removeUserFromParty ( io, socket )

		// user was still in parties, remove him from these parties
		if ( currentPartyIds ) {
			currentPartyIds.forEach ( ( partyId ) => {
				const usersStillInParty = party.getUsersForParty ( partyId )
				io.sockets.in ( partyId ).emit ( 'action', { type: 'SET_USERS_IN_PARTY', payload: usersStillInParty } )
			} )
		}
	},

	getMessagesInParty: ( partyId ) => {
		// Read all users and in which parties they currently reside
		const currentMessagesInParties = appCache.get ( party.cacheKeys.messagesInParties )

		// Make sure we don't have the messages from another party as well
		return currentMessagesInParties
			? currentMessagesInParties.filter ( messageInParty => messageInParty.partyId
			=== partyId ) : []
	},

	sendMessageToParty: ( io, socket, message, partyId, userName ) => {

		// Read all messages in the party
		const messagesInCurrentParty = party.getMessagesInParty ( partyId )

		const messageWithUserName = { message, userName, partyId }

		// Add the message to the messagesInCurrentParty array
		messagesInCurrentParty.push ( messageWithUserName )

		// Set the messagesInParty in cache
		appCache.set ( party.cacheKeys.messagesInParties, messagesInCurrentParty )

		io.to ( partyId ).emit ( 'action', { type: 'PARTY_MESSAGE_RECEIVED', payload: messagesInCurrentParty } )
	},

	setPlayerState: debounce(( io, socket, payload, playerState, timeInVideo, partyId ) => {
		if ( playerState === 'playing' || playerState === 'paused' ) {
			io.to ( partyId ).emit ( 'action', { type: 'SET_PARTY_PLAYER_STATE', payload: { playerState, timeInVideo } } )
		}

	}, 500)
}