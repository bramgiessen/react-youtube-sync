// Libs & utils
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { routes } from './core/routes'

// CSS
import './index.css'

// Reducers
import combineReducers from './core/reducers'

// Apply middlewares and initialize store
const createStoreWithMiddlewares = applyMiddleware ( ReduxThunk ) ( createStore )
const store = createStoreWithMiddlewares ( combineReducers )

ReactDOM.render (
	<Provider store={store}>
		<Router
			history={browserHistory}
			routes={routes}
		/>
	</Provider>,
	document.getElementById ( 'root' )
)