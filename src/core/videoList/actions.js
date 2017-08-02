// API
import { youtubeApi } from '../api/index'

export const videoListActions = {
	IS_FETCHING: 'IS_FETCHING',
	SET_YOUTUBE_RESULTS: 'SET_YOUTUBE_RESULTS',


	isFetching: bool => ({
		type: videoListActions.IS_FETCHING,
		payload: bool
	}),

	setYoutubeResults: results => ({
		type: videoListActions.SET_YOUTUBE_RESULTS,
		payload: results
	}),

	/**
	 * Action creator that handles the fetching of an initial set
	 * of movies from Youtube the user can browse through
	 * @returns {Function}
	 */
	loadInitialYoutubeMovies: () => {
		return async function ( dispatch ) {
			try {
				// Let the rest of the application know we are fetching search results
				dispatch ( videoListActions.isFetching ( true ) )

				// Fetch the search results and save them in store
				const youtubeMovies = await youtubeApi.fetchYoutubeSearchResults ( 'movie', 'movie' )
				dispatch ( videoListActions.setYoutubeResults ( youtubeMovies.items ) )

				// Let the rest of the application know we are no longer busy fetching
				dispatch ( videoListActions.isFetching ( false ) )
			}
			catch ( err ) {
			}
		}
	}
}