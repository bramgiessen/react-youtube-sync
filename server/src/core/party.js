// Libs & utils
import { generalUtils, cacheUtils } from '../utils/index'
import { debounce } from 'lodash'

export const party = {

	// Keeping all parties in memory for this demo / P.O.C.
	// in production software this would be persisted in i.e. a database
	activeParties: [
		// {
		// 	partyId:0,
		// 	selectedVideo:{},
		// 	videoPlayer: {
		//  	playerState: 'paused',
		//         timeInVideo : 0
		//     },
		//     videoPlayerInterval : null,
		// 	usersInParty:[],
		// 	messagesInParty:[]
		// }
	],

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

		// Add a new party with the generated partyId to the activeParties array
		party.activeParties.push({
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
	 * Make given socket leave all socketIo managed rooms it is currently in
     * @param io
     * @param socket
     */
	leaveSocketIoRooms: ( io, socket ) => {
		const roomsForSocket = io.sockets.adapter.sids[ socket.id ]
		for ( var room in roomsForSocket ) {
			socket.leave ( room )
		}
	},

    /**
	 * Returns true if party with given partyId already exists
     * @param partyId
     * @returns {Array|boolean}
     */
	partyExists: ( partyId ) => {
		const partyIds = party.activeParties.map(activeParty => activeParty.partyId)
		return partyIds && partyIds.indexOf ( partyId ) !== -1
	},

    /**
	 * Get an active party by given partyId
     * @param partyId
     * @returns {*}
     */
	getPartyById: (partyId) => {
		return  party.activeParties.find((activeParty) => activeParty.partyId && activeParty.partyId === partyId)
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
	 * Add a user to a specific party
     * @param io
     * @param socket
     * @param partyId
     * @param userName
     */
	addUserToParty: ( io, socket, partyId, userName ) => {
        const partyForId = party.getPartyById(partyId)
        const socketId = socket.id
        const userInParty = { socketId, partyId, userName }

        // Make sure the user isn't in any other parties anymore
       	party.removeUserFromParties(io, socket)

		// Add the user to the selected party
        partyForId.usersInParty.push(userInParty)

		// Connect the user to the new party
		socket.join ( partyId )
	},

    /**
	 * Remove a user from all parties it is currently in
     * @param io
     * @param socket
     */
	removeUserFromParties: ( io, socket ) => {
		const socketId = socket.id

        // Make sure the user isn't in any server managed parties anymore
        party.activeParties.forEach((activeParty) => {
            activeParty.usersInParty = activeParty.usersInParty.filter((user) => {
                return user.socketId !== socketId
            })
        })

		// Disconnect the socket from the parties / rooms managed by socketIo
		party.leaveSocketIoRooms(io, socket)
	},

    /**
	 * Retrieve all users that are in a specific party
     * @param partyId
     * @returns {*}
     */
	getUsersForParty: ( partyId ) => {
		const partyForId = party.activeParties.find((activeParty) => activeParty.partyId === partyId)
		return partyForId ? partyForId.usersInParty : []
	},

    /**
	 * Retrieve all the party ids from all parties a user ( referenced by socketId ) is currently in
     * @param socketId
     * @returns {Array}
     */
	getPartyIdsForUser: ( socketId ) => {
        return party.activeParties.filter((activeParty) => {
        	return activeParty.usersInParty.find((user) =>  user.socketId === socketId)
		}).map((activeParty) => activeParty.partyId)
	},

    /**
	 * Returns the user object that belongs to a specific socketId
     * @param socketId
     * @returns {*}
     */
	getUserForSocketId: (socketId) => {
		const partyIdsForUser = party.getPartyIdsForUser(socketId)

        const user = party.activeParties.filter((activeParty) => {
            return partyIdsForUser.indexOf(activeParty.partyId) !== -1
        }).map((activeParty) => activeParty.usersInParty).find((userInParty) => {
			return userInParty && userInParty[0].socketId === socketId
		})

		return user ? user[0] : null
	},

    /**
	 * Returns true is user is authenticated
	 * (right now a user is authenticated if he/she simply has a username)
     * @param socketId
     */
	isUserAuthenticated: (socketId) => {
		const user = party.getUserForSocketId(socketId)

		return user && user.userName
	},

    /**
	 * Returns true if given user is in a party with given partyId
     * @param user
     * @param partyId
     * @returns {*|Array|boolean}
     */
	isUserInParty: (socketId, partyId) => {
		const partyIdsForUser = party.getPartyIdsForUser(socketId)

		return partyIdsForUser && (partyIdsForUser.indexOf(partyId) !== -1)
	},

    /**
	 * Returns true if the given user is a member of the given party and has a userName
     * @param socketId
     * @param partyId
     * @returns {*|Array|boolean}
     */
    isUserAuthorizedInParty: (socketId, partyId) => {
       return party.isUserInParty(socketId, partyId) && party.isUserAuthenticated(socketId)
    },

    /**
	 * 1. Removes a user from all parties it is currently in
	 * 2. Notifies all other clients in these parties that the user has been disconnected
     * @param io
     * @param socket
     */
	disconnectFromParty: ( io, socket ) => {
		const currentPartyIds = party.getPartyIdsForUser ( socket.id )
		party.removeUserFromParties ( io, socket )

		// user was still in parties, remove him from these parties
		if ( currentPartyIds ) {
			currentPartyIds.forEach ( ( partyId ) => {
				const usersStillInParty = party.getUsersForParty ( partyId )
				io.sockets.in ( partyId ).emit ( 'action', { type: 'SET_USERS_IN_PARTY', payload: usersStillInParty } )
			} )
		}
	},

    /**
	 * Retrieve all messages that were posted inside a party
     * @param partyId
     * @returns {Array|*}
     */
	getMessagesInParty: ( partyId ) => {
        const partyForId = party.activeParties.find((activeParty) => activeParty.partyId === partyId)

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
        const userForSocketId = party.getUserForSocketId(socketId)
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
		if(!party.isUserAuthorizedInParty(socket.id, partyId)){
			return false
		}

        const partyForId = party.getPartyById(partyId)
        const videoPlayerForParty = party.getVideoPlayerForParty(partyId)
		const playerStateChangeMessage = party.generatePlayerStateChangeMessage(socket.id, playerState, timeInVideo)

		// If the playerState has been changed to 'playing' or 'paused' -> let all clients in the party know
		if ( playerState === 'playing' || playerState === 'paused' ) {
            videoPlayerForParty.playerState = playerState
            videoPlayerForParty.timeInVideo = timeInVideo
			io.to ( partyId ).emit ( 'action', { type: 'SET_PARTY_PLAYER_STATE', payload: videoPlayerForParty } )
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