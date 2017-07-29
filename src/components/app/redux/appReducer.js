// Libs & utils
import Immutable from 'seamless-immutable'

const initialState = Immutable({
	isFetching: false,
	error: null
})

export const appReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		default:
			return state
	}
}