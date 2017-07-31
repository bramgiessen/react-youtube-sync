export const searchBarActions = {
	TOGGLE_SEARCH_FIELD: 'TOGGLE_SEARCH_FIELD',
	NAVIGATE_TO_SEARCH_RESULTS: 'NAVIGATE_TO_SEARCH_RESULTS',

	navigateToSearchResults: query => ({
		type: searchBarActions.NAVIGATE_TO_SEARCH_RESULTS,
		payload: {
			pathname: `/search?q=${query}`
		}
	}),

	toggleSearchField: () => ({
		type: searchBarActions.TOGGLE_SEARCH_FIELD
	})
}