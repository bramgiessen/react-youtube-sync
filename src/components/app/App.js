// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './App.css'
import 'font-awesome/css/font-awesome.min.css'

// Components
import AppHeader from '../appHeader/AppHeader'
import SetUserNamePopup from '../setUserNamePopup/SetUserNamePopup'

// Actions
import { appActions } from "../../core/app"
import { searchActions } from "../../core/search"
import { userActions } from "../../core/user"

class App extends Component {

	componentWillUpdate ( nextProps ) {
		// Check if the current path has been changed, if so -> navigate to new path
		if ( nextProps.app.currentPath !== this.props.app.currentPath ) {
			this.props.router.push ( nextProps.app.currentPath )
		}

		// If the partyId changes -> navigate to new party
		if ( nextProps.party.partyId !== this.props.party.partyId ) {
			// Navigate to newly created party
			this.props.navigateToPath ( `/party/${nextProps.party.partyId}` )
		}
	}

	render () {
		return (
			<div className="app grid">

				<AppHeader
					search={this.props.search}
					user={this.props.user}
					toggleSearch={this.props.toggleSearch}
					handleSearch={this.props.handleSearch}
					router={this.props.router}
				/>

				<SetUserNamePopup
					isVisible={!this.props.user || !this.props.user.userName}
					handleSetUserName={this.props.setUserName}
				/>

				<main className="main">
					{/* Render the child component passed by react-router: */}
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
		search: state.search,
		user: state.user,
		app: state.app,
		party: state.party
	}
}

const mapDispatchToProps = {
	navigateToPath: appActions.navigateToPath,
	setWebsocketConnection: appActions.setWebsocketConnection,
	handleSearch: searchActions.handleSearch,
	toggleSearch: searchActions.toggleSearchField,
	setUserName: userActions.setUserName
}

App = connect ( mapStateToProps, mapDispatchToProps ) ( App )

export default App
