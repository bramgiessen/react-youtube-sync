// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './App.css'
import 'font-awesome/css/font-awesome.min.css'

// Components
import LoadingIndicator from '../loadingIndicator/LoadingIndicator'
import AppHeader from '../appHeader/AppHeader'

class App extends Component {
	render () {
		return (
			<div className="App grid">
				<LoadingIndicator loading={true}/>

				<AppHeader />
			</div>
		)
	}
}

App = connect(function (state) {
	return state
})(App)

export default App;
