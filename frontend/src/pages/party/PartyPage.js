// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// CSS
import './PartyPage.css'

// Components
import VideoPlayer from '../../components/videoPlayer/VideoPlayer'
import ChatBox from '../../components/chatBox/ChatBox'

class PartyPage extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired
	}

	constructor ( props ) {
		super ( props )
		this.state = {}
	}

	handleFocus = ( event ) => {
		event.target.select ();
	}

	/**
	 * Render block where users can copy their sharable party url from
	 * @param partyUrl
	 * @returns {XML}
	 */
	renderShareablePArtyUrl = ( partyUrl ) => {
		return (
			<div className="share-party-url">
				<h2 className="title">Your shareable party URL:</h2>
				<input type="text"
							 readOnly='readonly'
							 value={partyUrl}
							 onFocus={this.handleFocus}/>
			</div>
		)
	}

	/**
	 * Render a list of users that are currently in the party
	 * @param usersInParty
	 * @returns {XML}
	 */
	renderUserList = ( usersInParty ) => {
		const users = usersInParty.map ( ( user, index ) => {
			return (
				<div className="user" key={index}>
					<span className="user-name">{user}</span>
				</div>
			)
		} )

		return (
			<div className="users-in-party-list">
				<h2 className="title">Users in party</h2>
				{users}
			</div>
		)
	}

	render () {
		const { selectedVideo } = this.props
		const partyUrl = window.location.href.split ( '?' )[ 0 ]
		const usersInParty = [ 'bram', 'gijs' ]

		return (
			<div className="party-page">
				<div className="g-row">
					<div className="g-col">
						{this.renderShareablePArtyUrl ( partyUrl )}

						<div className="content-flex-horizontal">
							<div className="player-container">
								<VideoPlayer
									selectedVideo={selectedVideo}
								/>
							</div>

							{this.renderUserList ( usersInParty )}
						</div>

						<ChatBox />

					</div>
				</div>
			</div>
		)
	}
}


//=====================================
//  CONNECT
//-------------------------------------

const mapStateToProps = ( state ) => {
	return {
		selectedVideo: state.videoList.selectedVideo
	}
}

const mapDispatchToProps = {}

PartyPage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( PartyPage )

export default PartyPage