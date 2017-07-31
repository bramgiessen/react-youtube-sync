// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './App.css'
import 'font-awesome/css/font-awesome.min.css'

// Components
import AppHeader from '../appHeader/AppHeader'

// Actions
import { searchBarActions as searchActions } from "../searchBar/redux/searchBarActions"

class App extends Component {
	render () {
		return (
			<div className="app grid">

				<AppHeader
					searchBar={this.props.searchBar}
					toggleSearch={this.props.toggleSearch}
					handleSearch={this.props.handleSearch}
				/>

				<main className="main">
					{/* Render the childen component passed by react-router: */}
					{this.props.children}
				</main>

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

export default App
