export const cache = {

	// Keeping all parties in memory for this demo / P.O.C.
	// in production software this would be persisted in i.e. a database
	parties: [
		// {
		// 	partyId: 0,
		// 	selectedVideo: {},
		// 	waitingForAllUsersToBeReady: false,
		// 	videoPlayer: {
		// 		playerState: 'paused',
		// 		timeInVideo: 0,
		// 		lastStateChangeInitiator: null
		// 	},
		// 	videoPlayerInterval: null,
		// 	usersInParty: [],
		// 	messagesInParty: []
		// }
	],

	// Keeping all connected users in memory for this demo / P.O.C.
	// in production software this would be persisted in i.e. a database
	users: [
		// {
		// 	socketId: '',
		// 	userName: '',
		// 	readyToPlayState: {
		// 		clientIsReady: false,
		// 		timeInVideo: 0
		// 	}
		// }
	]
}