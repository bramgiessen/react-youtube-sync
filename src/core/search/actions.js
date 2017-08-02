export const searchActions = {
	TOGGLE_SEARCH_FIELD: 'TOGGLE_SEARCH_FIELD',
	NAVIGATE_TO_SEARCH_RESULTS: 'NAVIGATE_TO_SEARCH_RESULTS',


	navigateToSearchResults: query => ({
		type: searchActions.NAVIGATE_TO_SEARCH_RESULTS,
		payload: {
			pathname: `/search?q=${query}`
		}
	}),

	toggleSearchField: () => ({
		type: searchActions.TOGGLE_SEARCH_FIELD
	})
}