// Libs & utils
import queryString from 'query-string'

// Constants
import { YOUTUBE_SEARCH_URL, YOUTUBE_API_KEY } from "../constants"

/**
 * Fetch video search results from the Youtube API
 * @param query
 * @param videoType
 * @returns {Promise.<TResult>}
 */
export function fetchYoutubeSearchResults( query, videoType = 'any' ){
	const options = {
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
	}

	const params = queryString.stringify({
		videoType,
		'key' : YOUTUBE_API_KEY,
		'q' : query,
		'part' : 'snippet',
		'type' : 'video',
		'maxResults' : 50
	})

	return fetch(`${YOUTUBE_SEARCH_URL}?${params}`, options)
		.then(handleRestResponse)
		.then((response)=>response)
}


function handleRestResponse(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response.json())
	} else {
		return Promise.resolve(response.json())
			.then(message => {
				const error = new Error(`${message.message} (code ${message.statusCode})`)
				error.status = response.status
				error.statusCode = message.statusCode

				throw error
			})
	}
}