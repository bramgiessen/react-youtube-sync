// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './App.css'
import 'font-awesome/css/font-awesome.min.css'

// Components
import AppHeader from '../appHeader/AppHeader'

// Actions
import { searchActions } from "../../core/search/index"

class App extends Component {
	/**
	 * Navigate to search results upon search submission
	 */
	handleSearch = (query) => {
		this.props.router.push ( `/search/${query}` )
		this.props.toggleSearch()
	}

	render () {
		return (
			<div className="app grid">

				<AppHeader
					search={this.props.search}
					user={this.props.user}
					toggleSearch={this.props.toggleSearch}
					handleSearch={this.handleSearch}
					router={this.props.router}
				/>

				<main className="main">
					{/* Render the childen component passed by react-router: */}
					{this.props.children}
				</main>

			</div>
		)
	}
}

//=====================================
//  CONNECT
//-------------------------------------

const mapStateToProps = ( state ) => {
	return {
		search : state.search,
		user: state.user,
	}
}

const mapDispatchToProps = {
	toggleSearch: searchActions.toggleSearchField,
	setSearchQuery: searchActions.setSearchQuery
}

App = connect ( mapStateToProps, mapDispatchToProps ) ( App )

export default App
