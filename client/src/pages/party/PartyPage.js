// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// CSS
import './PartyPage.css'

// Components
import VideoPlayer from '../../components/videoPlayer/VideoPlayer'
import ChatBox from '../../components/chatBox/ChatBox'

// Actions
import { partyActions } from '../../core/party'
import { userActions } from '../../core/user'
import { videoPlayerActions } from '../../core/videoPlayer'

class PartyPage extends Component {
	// todo: make all proptypes match actual proptypes
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		connectToParty: PropTypes.func.isRequired,
        userName: PropTypes.string
	}

	constructor ( props ) {
		super ( props )
		this.state = {}
		this.partyId = this.props.partyId || this.props.params.partyId
	}

	componentDidMount () {
		const { connectToParty, userName } = this.props

		// Try to connect to the selected party
		connectToParty ( userName, this.partyId )
	}

	handleFocus = ( event ) => {
		// we use setSelectionRange() because select() doesn't work on IOS
		event.target.setSelectionRange(0, 9999)
    }

	/**
	 * Render block where users can copy their sharable party url from
	 * @param partyUrl
	 * @returns {XML}
	 */
	renderShareablePartyUrl = ( partyUrl ) => {
		return (
			<div className="share-party-url">
				<h2 className="title">Your shareable party URL:</h2>
				<input type="text"
							 readOnly='readonly'
							 value={partyUrl}
					   		 onClick={this.handleFocus}
							 />
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
		const {
			selectedVideo,
			partyState,
			setPlayerProgress,
			videoPlayerIsLoaded,
			videoPlayerIsMuted,
			videoPlayerIsMaximized,
			usersInParty,
			emitNewPlayerStateForPartyToServer,
			emitClientReadyStateToServer,
			partyVideoPlayerState,
			setPlayerMutedState,
			setPlayerIsLoadedState,
			handleMaximizeBtnPressed,
			videoProgress,
			userName
		} = this.props

		const partyUrl = window.location.href.split ( '?' )[ 0 ]

		return (
			<div className="party-page">
				<div className="g-row">
					<div className="g-col">
						{this.renderShareablePartyUrl ( partyUrl )}

						<div className="content-flex-horizontal">
							<div className="player-container">
								<VideoPlayer
									selectedVideo={selectedVideo}
									partyId={this.partyId}
									userName={userName}
									videoPlayerIsMuted={videoPlayerIsMuted}
									videoPlayerIsMaximized={videoPlayerIsMaximized}
									videoPlayerIsLoaded={videoPlayerIsLoaded}
									videoProgress={videoProgress}
									partyVideoPlayerState={partyVideoPlayerState}
									emitClientReadyStateToServer={emitClientReadyStateToServer}
									emitNewPlayerStateToServer={emitNewPlayerStateForPartyToServer}
									setPlayerMutedState={setPlayerMutedState}
									setPlayerProgress={setPlayerProgress}
									setPlayerIsLoadedState={setPlayerIsLoadedState}
									handleMaximizeBtnPressed={handleMaximizeBtnPressed}
								/>
							</div>

							{this.renderUserList ( usersInParty )}
						</div>

						<ChatBox
							onMessageSend={this.props.sendMessageToParty}
							partyId={this.partyId}
							userName={userName}
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
		partyState: state.party.partyState,
		usersInParty: state.party.usersInParty,
		messagesInParty: state.party.messagesInParty,
		partyVideoPlayerState: state.party.videoPlayerState,
		videoPlayerIsMuted: state.videoPlayer.videoPlayerIsMuted,
		videoProgress: state.videoPlayer.videoProgress,
		videoPlayerIsMaximized: state.videoPlayer.videoPlayerIsMaximized,
		videoPlayerIsLoaded: state.videoPlayer.videoPlayerIsLoaded,
	}
}

const mapDispatchToProps = {
	connectToParty: userActions.connectToParty,
	emitClientReadyStateToServer: userActions.emitClientReadyStateToServer,
	sendMessageToParty: partyActions.sendMessageToParty,
	emitNewPlayerStateForPartyToServer: partyActions.emitNewPlayerStateForPartyToServer,
	setPlayerMutedState: videoPlayerActions.setPlayerMutedState,
	setPlayerIsLoadedState: videoPlayerActions.setPlayerIsLoadedState,
	handleMaximizeBtnPressed: videoPlayerActions.handleMaximizeBtnPressed,
	setPlayerProgress: videoPlayerActions.setPlayerProgress
}

PartyPage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( PartyPage )

export default PartyPage