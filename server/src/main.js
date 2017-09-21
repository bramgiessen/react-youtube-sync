// Libs & utils
import { createServer } from 'http'
import socketIo from 'socket.io'
import debugFactory from 'debug'
import { generalUtils } from './utils/index'
import { partySocketHandlers, userSocketHandlers } from './sockets/index'

// Configuration files
import { appConfig } from './config/index'

//=====================================
//  INITIALIZE
//-------------------------------------
const debug = debugFactory ( 'APP:MAIN' )
const app = createServer ()
const io = socketIo ( app )


//=====================================
//  LISTEN
//-------------------------------------
app.listen ( appConfig.port, appConfig.host, error => {
	if ( error ) {
		debug ( error )
	}
	else {
		debug ( `Server listening @ ${appConfig.host}:${appConfig.port}` )
	}
} )

//=====================================
//  SOCKET.IO HANDLERS
//-------------------------------------
io.on ( 'connection', ( socket ) => {
	// Debug information about user connection
	debug ( `User with id ${socket.id} connected` )

	// Create event handlers for this socket
	var eventHandlers = [
		partySocketHandlers,
        userSocketHandlers
	]

	// merge all eventHandlers into one object
	const combinedEventHandlers = generalUtils.mergeObjectsInArray ( eventHandlers )

	// Bind eventHandlers to corresponding actions
	socket.on ( 'action', ( action ) => {
		const eventHandler = combinedEventHandlers[ action.type ]
		if ( eventHandler ) {
			eventHandler ( io, socket, action.payload )
		}
	} )

	// Remove closed connections from our open connections list
	socket.on ( 'disconnect', ( ) => {
        debug ( `User with id ${socket.id} disconnected` )
        userSocketHandlers.WEBSOCKET_DISCONNECT_FROM_PARTY ( io, socket )
	} )
} )

