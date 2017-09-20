// Libs & utils
import { party, user } from '../core/index'

export const userSocketHandlers = {
    'WEBSOCKET_CONNECT_TO_PARTY': connectToParty,
    'WEBSOCKET_DISCONNECT_FROM_PARTY': disconnectFromAllParties,
}

/**
 * Connect a user to a specific party
 *
 * 1. Gather necessary details about the party
 * 2. Add the user to the party
 * 3. Emit all necessary party details back to the just connected user
 *
 * @param io
 * @param socket
 * @param payload
 */
function connectToParty ( io, socket, payload ) {
    const { userName, partyId } = payload
    let userJoinedMessage

    // Make sure the party we are trying to join actually exists
    // if not -> let the client know that the party he is trying to join doesn't exist
    if(!party.partyExists(partyId)){
        socket.emit ( 'action', { type: 'SET_PARTY_STATE', payload: 'inactive' } )
        return false
    }

    // ONLY if the client provides a username -> add him to the party
    if(userName){
        // Create a new message to let everybody know that a new user just joined the party
        userJoinedMessage = party.generateUserJoinedMessage(userName, partyId)
    }else{
        socket.emit ( 'action', { type: 'SET_PARTY_STATE', payload: 'inactive' } )
    }

    // Create a new user if the user doesn't already exists
    user.createNewUser (socket, userName)

    // Add the user to the party
    user.addUserToParty ( io, socket, partyId, userName )

    // Gather the selected video details for the party
    const videoForParty = party.getSelectedVideoForParty ( partyId )

    // Get the current Video player state for the party
    const videoPlayerForParty = party.getVideoPlayerForParty(partyId)

    // Gather the list of users currently connected to the party
    const usersInParty = party.getUsersForParty ( partyId )

    // Gather all messages that have previously been posted in the party
    // and add a new message to let everybody know that a new user just joined the party
    const messagesInParty = party.getMessagesInParty ( partyId )
    if(userJoinedMessage) {messagesInParty.push( userJoinedMessage )}

    // If the party is valid and thus has a selected video -> emit all gathered party details to the just connected user
    if ( videoForParty ) {
        // Let the client know which video is selected in the party:
        socket.emit ( 'action', { type: 'SET_SELECTED_VIDEO', payload: videoForParty } )

        // Let the client know what the current playerState is in the party ('playing', 'paused' etc.)
        socket.emit ( 'action', { type: 'SET_PARTY_PLAYER_STATE', payload: videoPlayerForParty } )

        // Let the client know which other users are currently connected to the party
        io.to ( partyId ).emit ( 'action', { type: 'SET_USERS_IN_PARTY', payload: usersInParty } )

        // Resend all messages that have been posted in the party to all clients in the party
        // todo: optimize by only sending new messages to already connected users
        io.to ( partyId ).emit ( 'action', { type: 'PARTY_MESSAGE_RECEIVED', payload: messagesInParty } )
    }
}

/**
 * Disconnect a client from all parties it is currently connected to
 * @param io
 * @param socket
 */
function disconnectFromAllParties ( io, socket ) {
    user.disconnectFromParty ( io, socket )
}
