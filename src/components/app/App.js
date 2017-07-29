// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './App.css'
import 'font-awesome/css/font-awesome.min.css'

// Components
import LoadingIndicator from '../loadingIndicator/LoadingIndicator'
import AppHeader from '../appHeader/AppHeader'

// Actions
import { searchBarActions as searchActions } from "../searchBar/redux/searchBarActions"

class App extends Component {
	render () {
		const isFetching = this.props.app.isFetching

		console.log ( this.props )
		return (
			<div className="App grid">
				<LoadingIndicator
					loading={isFetching}
				/>

				<AppHeader
					searchBar={this.props.searchBar}
					toggleSearch={this.props.toggleSearch}
					handleSearch={this.props.handleSearch}
				/>

			</div>
		)
	}
}

const mapStateToProps = ( state ) => {
	return state
}

const mapDispatchToProps = {
	toggleSearch: searchActions.toggleSearchField,
	handleSearch: searchActions.navigateToSearchResults
}

App = connect ( mapStateToProps, mapDispatchToProps ) ( App )

export default App;
