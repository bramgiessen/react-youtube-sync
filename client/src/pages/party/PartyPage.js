// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { generalUtils } from '../../core/utils/index'

// CSS
import './PartyPage.css'

// Components
import VideoPlayer from '../../components/videoPlayer/VideoPlayer'
import ChatBox from '../../components/chatBox/ChatBox'

// Actions
import { partyActions } from '../../core/party/index'

class PartyPage extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		connectToParty: PropTypes.func.isRequired,
	}

	constructor ( props ) {
		super ( props )
		this.state = {}
		this.partyId = generalUtils.getPartyIdFromUrl ( window.location.href )
	}

	componentDidMount () {
		const { connectToParty, userName } = this.props

		// Try to connect to the selected party
		connectToParty ( userName, this.partyId )
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
					<span className="user-name">{user.userName}</span>
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
		const { selectedVideo, usersInParty, setVideoPlayerState, playerState } = this.props
		const partyUrl = window.location.href.split ( '?' )[ 0 ]


		return (
			<div className="party-page">
				<div className="g-row">
					<div className="g-col">
						{this.renderShareablePArtyUrl ( partyUrl )}

						<div className="content-flex-horizontal">
							<div className="player-container">
								<VideoPlayer
									selectedVideo={selectedVideo}
									partyId={this.partyId}
									onPlayerStateChange={setVideoPlayerState}
									playerState={playerState}
								/>
							</div>

							{this.renderUserList ( usersInParty )}
						</div>

						<ChatBox
							onMessageSend={this.props.sendMessageToParty}
							partyId={this.partyId}
							userName={this.props.userName}
							messagesInParty={this.props.messagesInParty}
						/>

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
		selectedVideo: state.party.selectedVideo,
		userName: state.user.userName,
		partyId: state.party.partyId,
		usersInParty: state.party.usersInParty,
		messagesInParty: state.party.messagesInParty,
		playerState: state.party.playerState
	}
}

const mapDispatchToProps = {
	connectToParty: partyActions.connectToParty,
	sendMessageToParty: partyActions.sendMessageToParty,
	setVideoPlayerState: partyActions.setVideoPlayerState
}

PartyPage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( PartyPage )

export default PartyPage