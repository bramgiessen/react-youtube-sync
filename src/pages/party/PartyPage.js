// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// CSS
import './PartyPage.css'

// Components
import VideoPlayer from '../../components/videoPlayer/VideoPlayer'
import ChatBox from '../../components/chatBox/ChatBox'
import ShareablePartyUrl from '../../components/shareablePartyUrl/ShareablePartyUrl'
import UserList from '../../components/userList/UserList'

// Actions
import { partyActions } from '../../core/party'
import { userActions } from '../../core/user'
import { videoPlayerActions } from '../../core/videoPlayer'

class PartyPage extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		userName: PropTypes.string,
		partyId: PropTypes.string,
		partyState: PropTypes.string.isRequired,
		usersInParty: PropTypes.array.isRequired,
		messagesInParty: PropTypes.array.isRequired,
		partyVideoPlayerState: PropTypes.object.isRequired,
		userVideoPlayerState: PropTypes.object.isRequired,
		videoPlayerIsMuted: PropTypes.bool.isRequired,
		videoProgress: PropTypes.number.isRequired,
		videoPlayerIsMaximized: PropTypes.bool.isRequired,
		videoPlayerIsLoaded: PropTypes.bool.isRequired,
		connectToParty: PropTypes.func.isRequired,
		sendMessageToParty: PropTypes.func.isRequired,
		emitNewPlayerStateForPartyToServer: PropTypes.func.isRequired,
		onPlayerStateChange: PropTypes.func.isRequired,
		setPlayerMutedState: PropTypes.func.isRequired,
		setPlayerIsLoadedState: PropTypes.func.isRequired,
		handleMaximizeBtnPressed: PropTypes.func.isRequired,
		setPlayerProgress: PropTypes.func.isRequired
	}

	constructor ( props ) {
		super ( props )
		this.partyId = this.props.partyId || this.props.params.partyId
	}

	componentDidMount () {
		const { connectToParty, userName } = this.props

		// If this user has a userName -> try to connect to the selected party
		if ( userName ) {
			connectToParty ( userName, this.partyId )
		}
	}

	componentDidUpdate ( prevProps, prevState ) {
		// If the user now chose a userName -> connect to the selected party
		if ( !prevProps.userName && this.props.userName ) {
			this.props.connectToParty ( this.props.userName, this.partyId )
		}
	}

	/**
	 * Render the party page
	 * @param props
	 * @returns {XML}
	 */
	renderPartyPage = ( props ) => {
		const {
			selectedVideo,
			videoPlayerIsLoaded,
			videoPlayerIsMuted,
			videoPlayerIsMaximized,
			usersInParty,
			emitNewPlayerStateForPartyToServer,
			onPlayerStateChange,
			partyVideoPlayerState,
			userVideoPlayerState,
			setPlayerProgress,
			setPlayerMutedState,
			setPlayerIsLoadedState,
			handleMaximizeBtnPressed,
			videoProgress,
			userName
		} = props
		const partyUrl = window.location.href.split ( '?' )[ 0 ]

		return (
			<div className="party-page">
				<div className="g-row">
					<div className="g-col">
						<ShareablePartyUrl partyUrl={partyUrl}/>

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
									userVideoPlayerState={userVideoPlayerState}
									partyVideoPlayerState={partyVideoPlayerState}
									onPlayerStateChange={onPlayerStateChange}
									emitNewPlayerStateToServer={emitNewPlayerStateForPartyToServer}
									setPlayerMutedState={setPlayerMutedState}
									setPlayerProgress={setPlayerProgress}
									setPlayerIsLoadedState={setPlayerIsLoadedState}
									handleMaximizeBtnPressed={handleMaximizeBtnPressed}
								/>
							</div>

							<UserList users={usersInParty}/>
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

	/**
	 * Renders a message letting the user know that the requested party does not exist
	 * @returns {XML}
	 */
	renderPartyNotFoundMessage = () => {
		return (
			<div className="party-not-found-container">
				<h1 className="header">Whoops..</h1>
				<span className="description">The requested party with id <b>"{this.partyId}"</b>
					does not seem to exist (anymore).. sorry! Could you check if you entered the right party-url?</span>
				<div className="back-btn" onClick={() => this.props.router.push ( '/' )}>Return</div>
			</div>
		)
	}

	render () {
		const { partyState } = this.props

		if ( partyState === 'active' ) {
			return this.renderPartyPage ( this.props )
		} else {
			return this.renderPartyNotFoundMessage ()
		}
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
		userVideoPlayerState: state.videoPlayer.videoPlayerState,
		videoPlayerIsMuted: state.videoPlayer.videoPlayerIsMuted,
		videoProgress: state.videoPlayer.videoProgress,
		videoPlayerIsMaximized: state.videoPlayer.videoPlayerIsMaximized,
		videoPlayerIsLoaded: state.videoPlayer.videoPlayerIsLoaded,
	}
}

const mapDispatchToProps = {
	connectToParty: userActions.connectToParty,
	sendMessageToParty: partyActions.sendMessageToParty,
	emitNewPlayerStateForPartyToServer: partyActions.emitNewPlayerStateForPartyToServer,
	onPlayerStateChange: videoPlayerActions.onPlayerStateChange,
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