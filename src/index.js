import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'

// CSS
import './index.css'

// Components
import App from './components/app/App'

// Functions
import combineReducers from './reducers'

// Apply middlewares and initialize store
const createStoreWithMiddlewares = applyMiddleware ( ReduxThunk ) ( createStore )
const store = createStoreWithMiddlewares ( combineReducers )

ReactDOM.render (
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById ( 'root' )
)