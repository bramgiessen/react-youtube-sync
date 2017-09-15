// Libs & utils
import { generalUtils, cacheUtils } from '../utils/index'
import { debounce } from 'lodash'

export const party = {

	// Keeping all parties in memory for this demo / P.O.C.
	// in production software this would be persisted in i.e.
	activeParties: [
		{
			partyId:0,
			partyInitiatorId: null,
			videoForParty:{
				videoDetails : {},
				videoState : 'paused',
				timeInVideo : 0
			},
            playerInterval : null,
			usersInParty:[],
			messagesInParty:[]
		}
	],

	createParty: ( io, socket ) => {
		const socketId = socket.id

		// Generate unique partyId
		let partyId = generalUtils.generateId ()
		while ( party.partyExists ( partyId ) ) {
			partyId = generalUtils.generateId ()
		}

		// Add a new party with the generated partyId to the activeParties array
		party.activeParties.push({
			partyId,
            partyInitiatorId: socketId,
            videoForParty: {},
            usersInParty:[],
            messagesInParty:[]
		})

		return partyId
	},

	leaveCurrentParties: ( io, socket ) => {
		const currentParties = io.sockets.adapter.sids[ socket.id ]
		for ( var party in currentParties ) {
			socket.leave ( party )
		}
	},

	partyExists: ( partyId ) => {
		const partyIds = party.activeParties.map(activeParty => activeParty.partyId)
		return partyIds && partyIds.indexOf ( partyId ) !== -1
	},

	setVideoForParty: ( io, socket, videoDetails ) => {
		const socketId = socket.id
		const currentParty = party.activeParties.find((activeParty) => activeParty.partyInitiatorId && activeParty.partyInitiatorId === socketId)

		// If we are trying to set the videoId for a non-existing party -> abort
		if(!currentParty){ return }

		// Set the selected video as a property for the corresponding party
        const videoForParty = { videoDetails, videoState: 'paused', timeInVideo: 0 }
		currentParty.videoForParty = videoForParty

		// The video has been set for this party -> remove the partyInitiatorId so
		// that the initiating user can continue to create new parties
        currentParty.partyInitiatorId = null
	},

	getVideoForParty: ( partyId ) => {
        const partyForId = party.activeParties.find((activeParty) => activeParty.partyId && activeParty.partyId === partyId)

		return partyForId && partyForId.videoForParty ?
            partyForId.videoForParty : {}
	},

	addUserToParty: ( io, socket, partyId, userName ) => {
		const socketId = socket.id
        const partyForId = party.activeParties.find((activeParty) => activeParty.partyId && activeParty.partyId === partyId)
        const userInParty = { socketId, partyId, userName }

        // Make sure the user isn't in any other parties anymore
       	party.removeUserFromParty(io, socket)

		// Add the user to the selected party
        partyForId.usersInParty.push(userInParty)

		// Connect the user to the new party
		socket.join ( partyId )
	},

	removeUserFromParty: ( io, socket ) => {
		const socketId = socket.id

        // Make sure the user isn't in any server managed parties anymore
        party.activeParties.forEach((activeParty) => {
            activeParty.usersInParty = activeParty.usersInParty.filter((user) => {
                return user.socketId !== socketId
            })
        })

		// Disconnect the socket from the party / room managed by socketIo
		party.leaveCurrentParties(io, socket)
	},

	getUsersForParty: ( partyId ) => {
		const partyForId = party.activeParties.find((activeParty) => activeParty.partyId === partyId)
		return partyForId ? partyForId.usersInParty : []
	},

	getPartyIdsForUser: ( socketId ) => {
        return party.activeParties.filter((activeParty) => {
        	return activeParty.usersInParty.find((user) =>  user.socketId === socketId)
		}).map((activeParty) => activeParty.partyId)
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
        const partyForId = party.activeParties.find((activeParty) => activeParty.partyId === partyId)

		return partyForId.messagesInParty
	},

	sendMessageToParty: ( io, socket, message, partyId, userName ) => {
		// Read all messages in the party
		const messagesInCurrentParty = party.getMessagesInParty ( partyId )

		const messageWithUserName = { message, userName, partyId }

		// Add the message to the messagesInCurrentParty array
		messagesInCurrentParty.push ( messageWithUserName )

		io.to ( partyId ).emit ( 'action', { type: 'PARTY_MESSAGE_RECEIVED', payload: messagesInCurrentParty } )
	},

	setPlayerState: debounce(( io, socket, payload, playerState, timeInVideo, partyId ) => {
        const partyForId = party.activeParties.find((activeParty) => activeParty.partyId === partyId)
		const videoForParty = party.getVideoForParty(partyId)

		console.log(playerState, timeInVideo)
		if ( playerState === 'playing' || playerState === 'paused' ) {
            videoForParty.videoState = playerState
			videoForParty.timeInVideo = timeInVideo
			io.to ( partyId ).emit ( 'action', { type: 'SET_PARTY_PLAYER_STATE', payload: { playerState, timeInVideo } } )
		}

		// Keep track of the time in the video while the video is playing
		if(playerState === 'playing') {
			if(!partyForId.playerInterval){
                partyForId.playerInterval = setInterval(() => {
                    videoForParty.timeInVideo += 1
                }, 1000)
			}
		} else if (playerState === 'paused' && videoForParty.playerInterval) {
			clearInterval(partyForId.playerInterval)
            partyForId.playerInterval = null
		}

	}, 500)
}