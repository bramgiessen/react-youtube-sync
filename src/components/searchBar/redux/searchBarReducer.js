// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { searchBarActions } from './searchBarActions'

const initialState = Immutable({
	expanded: false,
	currentQuery : null
})

export const searchBarReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case searchBarActions.TOGGLE_SEARCH_FIELD:
			return Immutable.set(state, 'expanded', !state.expanded)

		default:
			return state
	}
}