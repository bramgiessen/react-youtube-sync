import {cache} from './index'
import {party} from "./party";

export const user = {

    /**
	 * Create a new user if a user with the given socketId doesn't already exist
     * @param socket
     * @param userName
     */
	createNewUser: (socket, userName) => {
        const socketId = socket.id

        // If a user with the socketId doesn't exist yet -> create
        // a new user and add him to the activeUsers array
        if(!user.userExists(socketId)){
            const newUser = { socketId, userName, 'playerStatus': null }
            cache.users.push(newUser)
        }
	},

    /**
	 * Returns true if a user with given socketId exists in the activeUsers array
     * @param socketId
     * @returns {*}
     */
	userExists: (socketId) => {
		return !!user.getUserForId(socketId)
	},

    /**
	 * Returns the user that belongs to the specified socketId
	 * ( returns undefined if user doesn't exist )
     * @param socketId
     * @returns {*}
     */
	getUserForId: (socketId) => {
        return cache.users.find((activeUser) => activeUser.socketId === socketId)
	},

    /**
     * Returns true is user is authenticated
     * (right now a user is authenticated if he/she simply has a username)
     * @param socketId
     */
    isUserAuthenticated: (socketId) => {
        const userForId = user.getUserForId(socketId)

        return userForId && userForId.userName
    },

    /**
     * Retrieve all the party ids from all parties a user ( referenced by socketId ) is currently in
     * @param socketId
     * @returns {Array}
     */
    getPartyIdsForUser: ( socketId ) => {
        return cache.parties.filter((activeParty) => {
            return activeParty.usersInParty.find((userId) =>  userId === socketId)
        }).map((activeParty) => activeParty.partyId)
    },

    /**
     * Returns true if given user is in a party with given partyId
     * @param user
     * @param partyId
     * @returns {*|Array|boolean}
     */
    isUserInParty: (socketId, partyId) => {
        const partyIdsForUser = user.getPartyIdsForUser(socketId)

        return partyIdsForUser && (partyIdsForUser.indexOf(partyId) !== -1)
    },

    /**
     * Returns true if the given user is a member of the given party and is authenticated (has a userName)
     * @param socketId
     * @param partyId
     * @returns {*|Array|boolean}
     */
    isAuthorizedInParty: (socketId, partyId) => {
        return user.isUserInParty(socketId, partyId) && user.isUserAuthenticated(socketId)
    },

    /**
     * Make given socket/user leave all socketIo managed rooms it is currently in
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
     * Remove a user from all parties it is currently in
     * @param io
     * @param socket
     */
    removeUserFromParties: ( io, socket ) => {
        const socketId = socket.id

        // Make sure the user isn't in any server managed parties anymore
        cache.parties.forEach((activeParty) => {
            activeParty.usersInParty = activeParty.usersInParty.filter((userId) => {
                return userId !== socketId
            })
        })

        // Disconnect the socket from the parties / rooms managed by socketIo
        user.leaveSocketIoRooms(io, socket)
    },

    /**
     * Add a user to a specific party
     * @param io
     * @param socket
     * @param partyId
     * @param userName
     */
    addUserToParty: ( io, socket, partyId ) => {
        const partyForId = party.getPartyById(partyId)
        const socketId = socket.id

        // Make sure the user isn't in any other parties anymore
        user.removeUserFromParties(io, socket)

        // Add the users' socketId to the selected party
        partyForId.usersInParty.push(socketId)

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

}