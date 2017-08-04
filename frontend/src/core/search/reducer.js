// Libs & utils
import Immutable from 'seamless-immutable'

// Actions
import { searchActions } from './index'

const initialState = Immutable ( {
	expanded: false
} )

export const searchReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case searchActions.TOGGLE_SEARCH_FIELD:
			return Immutable.set ( state, 'expanded', !state.expanded )

		default:
			return state
	}
}