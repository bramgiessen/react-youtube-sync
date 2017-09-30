export const socketUtils = {

	/**
	 * Send a message to one specific client/socket
	 * @param socket
	 * @param actionType
	 * @param payload
	 */
	emitActionToClient: ( socket, actionType, payload ) => {
		socket.emit ( 'action', { type: actionType, payload } )
	},

	/**
	 * Send message to all clients/sockets in a party
	 * @param io
	 * @param partyId
	 * @param actionType
	 * @param payload
	 */
	emitActionToParty: ( io, partyId, actionType, payload ) => {
		io.to ( partyId ).emit ( 'action', { type: actionType, payload } )
	},

	/**
	 * Send a message to all clients/sockets in a party EXCEPT the sender
	 * @param socket
	 * @param partyId
	 * @param actionType
	 * @param payload
	 */
	broadcastActionToParty: ( socket, partyId, actionType, payload ) => {
		socket.broadcast.to ( partyId ).emit ( 'action', { type: actionType, payload } )
	}

}