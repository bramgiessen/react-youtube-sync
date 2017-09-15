// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { partyActions } from './index'


const initialState = Immutable ( {
	partyId: null,
	selectedVideo: {
        videoDetails: {
            id: '',
            title: '',
            description: '',
            thumbnailSrc: '',
            videoSource: ''
		},
        videoState: '',
		timeInVideo: 0
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
			// @todo: make sure selectedvideo also gets updated with new time of video!!
			return Immutable.flatMap({'playerState' : action.payload, 'selectedVideo' : action.payload.timeInVideo})

		default:
			return state
	}
}