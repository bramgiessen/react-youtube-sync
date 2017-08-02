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
	render () {
		return (
			<div className="app grid">

				<AppHeader
					search={this.props.search}
					toggleSearch={this.props.toggleSearch}
					handleSearch={this.props.handleSearch}
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
		search : state.search
	}
}

const mapDispatchToProps = {
	toggleSearch: searchActions.toggleSearchField,
	handleSearch: searchActions.navigateToSearchResults
}

App = connect ( mapStateToProps, mapDispatchToProps ) ( App )

export default App
