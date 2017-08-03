// API
import { youtubeApi } from '../api/index'

// import external actions
import { appActions } from '../app/index'

export const videoListActions = {
	IS_FETCHING: 'IS_FETCHING',
	SET_YOUTUBE_RESULTS: 'SET_YOUTUBE_RESULTS',
	SET_SELECTED_VIDEO: 'SET_SELECTED_VIDEO',


	isFetching: bool => ({
		type: videoListActions.IS_FETCHING,
		payload: bool
	}),

	setYoutubeResults: results => ({
		type: videoListActions.SET_YOUTUBE_RESULTS,
		payload: results
	}),

	setSelectedVideo: (videoId, videoSource) => ({
			type: videoListActions.SET_SELECTED_VIDEO,
			payload: {videoId, videoSource}
	}),

	/**
	 * Handle the selection of a video
	 * 1. set the selected video id in store
	 * 2. create a new party
	 * 3. Navigate to the party view
	 * @param videoId
	 * @param videoSource
	 * @returns {Function}
	 */
	handleVideoSelection: (videoId, videoSource) => {
		return async function ( dispatch ) {
			// Set the selected video id
			dispatch(videoListActions.setSelectedVideo(videoId, videoSource))

			// Create a new party
			// @todo: magic goes here

			// Navigate to newly created party
			dispatch(appActions.navigateToPath(`/party/1234`))
		}
	},

	/**
	 * Action creator that handles the fetching of videos from Youtube based on given query and videoType
	 * @param query
	 * @param videoType ('any', 'movie' or 'episode')
	 * @returns {Function}
	 */
	loadYoutubeVideos: (query, videoType = 'any') => {
		return async function ( dispatch ) {
			try {
				// Let the rest of the application know we are fetching search results
				dispatch ( videoListActions.isFetching ( true ) )

				// Fetch the search results and save them in store
				const youtubeMovies = await youtubeApi.fetchYoutubeSearchResults ( query, videoType )
				dispatch ( videoListActions.setYoutubeResults ( youtubeMovies.items ) )

				// Let the rest of the application know we are no longer busy fetching
				dispatch ( videoListActions.isFetching ( false ) )
			}
			catch ( err ) {
			}
		}
	}
}