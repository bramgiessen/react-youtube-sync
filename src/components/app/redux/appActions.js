//=====================================
//  appActions.js : Containing global app-wide actions
//-------------------------------------

// API functions
import { fetchYoutubeSearchResults } from "../../../rest/youtube-api"

export const appActions = {
	SET_USER_NAME: 'SET_USER_NAME',
	IS_FETCHING: 'IS_FETCHING',
	SET_YOUTUBE_SEARCH_RESULTS: 'SET_YOUTUBE_SEARCH_RESULTS',
	CREATE_PARTY: 'CREATE_PARTY',


	setUserName: userName => ({
		type: appActions.SET_USER_NAME,
		payload: userName
	}),

	isFetching: bool => ({
		type: appActions.IS_FETCHING,
		payload: bool
	}),

	setYoutubeSearchResults: results => ({
		type: appActions.SET_YOUTUBE_SEARCH_RESULTS,
		payload: results
	}),

	/**
	 * Action creator that handles the creation of a new party
	 * @param userName
	 * @returns {function(*=, *)}
	 */
	createParty: (userName) => {
		return (dispatch) => {
			// todo: write logic that creates party id in backend
		}
	},


	/**
	 * Action creator that handles the fetching of an initial set
	 * of movies from Youtube the user can browse through
	 * @returns {Function}
	 */
	loadInitialYoutubeMovies:() => {
		return async function (dispatch) {
			try {
				// Let the rest of the application know we are fetching search results
				dispatch(appActions.isFetching(true))

				// Fetch the search results and save them in store
				const youtubeMovies = await fetchYoutubeSearchResults('movie', 'movie')
				dispatch(appActions.setYoutubeSearchResults(youtubeMovies))

				// Let the rest of the application know we are no longer busy fetching
				dispatch(appActions.isFetching(false))
			}
			catch (err) {
			}
		}
	}
}