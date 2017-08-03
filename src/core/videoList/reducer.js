// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { videoListActions } from './index'

const initialState = Immutable ( {
	isFetching: false,
	youtubeVideos: [],
	selectedVideo: {videoId:null, videoSource:null},
	error: null
} )

export const videoListReducer = ( state = initialState, action ) => {
	switch ( action.type ) {

		case videoListActions.IS_FETCHING:
			return Immutable.set ( state, 'isFetching', action.payload )

		case videoListActions.SET_YOUTUBE_RESULTS:
			return Immutable.set ( state, 'youtubeVideos', action.payload )

		case videoListActions.SET_SELECTED_VIDEO:
			return Immutable.set ( state, 'selectedVideo', {...action.payload} )

		default:
			return state
	}
}