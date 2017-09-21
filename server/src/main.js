// Libs & utils
import { createServer } from 'http'
import socketIo from 'socket.io'
import debugFactory from 'debug'
import { generalUtils } from './utils/index'

// Socket handlers
import { partySocketHandlers, userSocketHandlers } from './sockets'

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

	//  Merge all separate eventHandlers into one object
	//  so that the eventHandlers can automatically be matched to corresponding actions
	var eventHandlers = generalUtils.mergeObjectsInArray ([
		partySocketHandlers,
        userSocketHandlers
		])

	// Bind eventHandlers to corresponding actions
	socket.on ( 'action', ( action ) => {
		const eventHandler = eventHandlers[ action.type ]

		// If there is an eventHandler defined for the given actionType
		// -> execute that eventHandler with parameters io, socket and the actions' payload
		if ( eventHandler ) {
			eventHandler ( io, socket, action.payload )
		}
	} )

	// When a client disconnects -> remove the clientId from all parties it was connected to
	socket.on ( 'disconnect', ( ) => {
        debug ( `User with id ${socket.id} disconnected` )
        userSocketHandlers.WS_TO_SERVER_DISCONNECT_FROM_PARTY ( io, socket )
	} )
} )

