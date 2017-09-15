// Libs & utils
import { party } from '../core/index'

export const partySocketHandlers = {
	'WEBSOCKET_CREATE_PARTY': createParty,
	'WEBSOCKET_SET_SELECTED_VIDEO': setSelectedVideoForParty,
	'WEBSOCKET_CONNECT_TO_PARTY': connectToParty,
	'WEBSOCKET_DISCONNECT_FROM_PARTY': disconnectFromAllParties,
	'WEBSOCKET_SEND_MESSAGE_TO_PARTY': sendMessageToParty,
	'WEBSOCKET_SET_VIDEO_PLAYER_STATE': setVideoPlayerState,
}

function createParty ( io, socket ) {
	const partyId = party.createParty ( io, socket )

	socket.emit ( 'action', { type: 'SET_PARTY_ID', payload: partyId } )
}

function setSelectedVideoForParty ( io, socket, video ) {
	party.setVideoForParty ( io, socket, video )
}

function connectToParty ( io, socket, payload ) {
	const { userName, partyId } = payload
	const videoForParty = party.getVideoForParty ( partyId )

	// Users
	party.addUserToParty ( io, socket, partyId, userName )
	const usersInParty = party.getUsersForParty ( partyId )

	// Messages
	const messagesInParty = party.getMessagesInParty ( partyId )

	if ( videoForParty ) {
        // Emit data necessary for joining the party
		socket.emit ( 'action', { type: 'SET_SELECTED_VIDEO', payload: videoForParty } )
		io.to ( partyId ).emit ( 'action', { type: 'SET_USERS_IN_PARTY', payload: usersInParty } )
		io.to ( partyId ).emit ( 'action', { type: 'PARTY_MESSAGE_RECEIVED', payload: messagesInParty } )
	}
}

function disconnectFromAllParties ( io, socket ) {
	party.disconnectFromParty ( io, socket )
}

function sendMessageToParty ( io, socket, payload ) {
	const { message, partyId, userName } = payload

	party.sendMessageToParty ( io, socket, message, partyId, userName )
}

function setVideoPlayerState ( io, socket, payload ) {
	const { playerState, timeInVideo, partyId } = payload

	party.setPlayerState(io, socket, payload, playerState, timeInVideo, partyId )
}