// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { partyActions } from './index'


const initialState = Immutable ( {
	partyId: null,
	selectedVideo: {
		id: '',
		title: '',
		description: '',
		thumbnailSrc: '',
		videoSource: ''
	},
	usersInParty: [],
	messagesInParty: [],
	playerState: {
		playerState: '',
		timeInVideo: 0
	}
} )

export const partyReducer = ( state = initialState, action ) => {
	switch ( action.type ) {

		case partyActions.SET_PARTY_ID:
			return Immutable.set ( state, 'partyId', action.payload )

		case partyActions.SET_SELECTED_VIDEO:
			return Immutable.set ( state, 'selectedVideo', { ...action.payload } )

		case partyActions.SET_USERS_IN_PARTY:
			return Immutable.set ( state, 'usersInParty', action.payload )

		case partyActions.PARTY_MESSAGE_RECEIVED:
			return Immutable.set ( state, 'messagesInParty', action.payload )

		case partyActions.SET_PARTY_PLAYER_STATE:
			return Immutable.set ( state, 'playerState', action.payload )


		default:
			return state
	}
}