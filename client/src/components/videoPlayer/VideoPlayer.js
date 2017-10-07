// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import classNames from 'classnames'
import { debounce } from 'lodash'
import { videoUtils, generalUtils } from '../../core/utils'

// CSS
import './VideoPlayer.css'

// Components
import VideoPlayerControls from '../videoPlayerControls/VideoPlayerControls'

// Actions
import { videoPlayerActions } from '../../core/videoPlayer'

class VideoPlayer extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		emitClientReadyStateToServer: PropTypes.func.isRequired,
		emitNewPlayerStateToServer: PropTypes.func.isRequired,
		partyId: PropTypes.string.isRequired,
		partyVideoPlayerState: PropTypes.object.isRequired,
		fullWidth: PropTypes.bool,
		userName: PropTypes.string
	}

	constructor ( props ) {
		super ( props )
		this.state = {
			videoPlayerIsMuted: false,
			videoPlayerIsMaximized: false,
			videoPlayerIsLoaded: false,
			videoProgress: 0
		}
	}

	componentDidUpdate ( prevProps, prevState ) {
		const { emitClientReadyStateToServer } = this.props
		const prevPartyPlayerState = prevProps.partyVideoPlayerState
		const currentPartyPlayerState = this.props.partyVideoPlayerState
		const internalVideoPlayer = this.videoPlayer.getInternalPlayer ()
		const videoPlayerIsLoaded = !!internalVideoPlayer

		// As soon as the videoPlayer is loaded, start listening for playerState commands from the server
		if ( videoPlayerIsLoaded ) {
			this.handlePauseVideoCommandsFromServer ( currentPartyPlayerState, internalVideoPlayer )
			this.handleSeekToCommandsFromServer ( prevPartyPlayerState, currentPartyPlayerState, internalVideoPlayer )
			this.youtubePlayerReadyHotfix ( prevPartyPlayerState, currentPartyPlayerState, emitClientReadyStateToServer )
		}
	}

	/**
	 * Hotfix to force this client to tell the server that it is ready to play after a user tries
	 * to resume playing after pausing a video.
	 * @param prevPartyPlayerState
	 * @param currentPartyPlayerState
	 * @param emitClientReadyStateToServer
	 */
	youtubePlayerReadyHotfix = ( prevPartyPlayerState, currentPartyPlayerState, emitClientReadyStateToServer ) => {
		const partyPlayerStateUpdated = prevPartyPlayerState !== currentPartyPlayerState
		// Description of the fix:
		//
		// When a user tries to play a video, the server by default sends out a pause command to all users
		// in the party. It then waits for all users to tell the server that they are done buffering before it sends
		// out a final play command to all users in the party. However, if the video was already paused and a user
		// tries to resume playing, the first pause command received by the server will be ignored as the Youtube
		// player doesn't see this as a valid playerState change.
		//
		// Fix: always send out a 'clientIsReady' message to the server in this case
		if ( partyPlayerStateUpdated && prevPartyPlayerState.playerState === 'paused'
			&& currentPartyPlayerState.playerState === 'paused'
			&& prevPartyPlayerState.timeInVideo === currentPartyPlayerState.timeInVideo ) {
			emitClientReadyStateToServer ( {
				clientIsReady: true,
				timeInVideo: currentPartyPlayerState.timeInVideo
			} )
		}
	}

	/**
	 * When the playerState for the party updates -> adjust this clients' videoPlayer to
	 * match the timeInVideo of the party
	 * @param prevPartyPlayerState
	 * @param currentPartyPlayerState
	 * @param internalVideoPlayer
	 */
	handleSeekToCommandsFromServer = ( prevPartyPlayerState, currentPartyPlayerState, internalVideoPlayer ) => {
		const partyPlayerStateUpdated = prevPartyPlayerState !== currentPartyPlayerState
		if ( partyPlayerStateUpdated ) {
			internalVideoPlayer.seekTo ( currentPartyPlayerState.timeInVideo )
		}
	}

	/**
	 * Handle pause commands that are received from the server
	 * ( these are pause commands that originate from another users' pause action )
	 * @param currentPartyPlayerState
	 * @param internalVideoPlayer
	 */
	handlePauseVideoCommandsFromServer = ( currentPartyPlayerState, internalVideoPlayer ) => {
		// If the server/party wants us to pause somewhere other than at the start of the video ->
		// seek to the timeInVideo provided by the server and pause the video at that time
		if ( currentPartyPlayerState.playerState === 'paused' && currentPartyPlayerState.timeInVideo !== 0 ) {
			internalVideoPlayer.seekTo ( currentPartyPlayerState.timeInVideo )
			internalVideoPlayer.pauseVideo ()
		}
	}

	/**
	 * When this user presses the play/pause button -> emit a play/pause event to the server
	 * letting the server know that this user wants to play the video for the entire party
	 * @param emitNewPlayerStateToServer
	 * @param progressInSeconds
	 * @param videoIsPlaying
	 * @param partyId
	 */
	handlePlayBtnPressed = ( emitNewPlayerStateToServer, progressInSeconds, videoIsPlaying, partyId ) => {
		emitNewPlayerStateToServer ( {
			playerState: videoIsPlaying ? 'paused' : 'playing',
			timeInVideo: progressInSeconds
		}, partyId )
	}

	/**
	 * Toggle the maximization of the videoPlayer
	 */
	handleMaximizeBtnPressed = () => {
		const videoPlayerIsMaximized = this.state.videoPlayerIsMaximized
		const videoPlayerElem = document.getElementsByClassName ( 'video-player' )[ 0 ]

		if ( videoPlayerIsMaximized ) {
			generalUtils.exitFullScreen ()
		} else if ( !videoPlayerIsMaximized ) {
			generalUtils.requestFullScreenOnElement ( videoPlayerElem )
		}
		this.setState ( { videoPlayerIsMaximized: !videoPlayerIsMaximized } )
	}

	/**
	 * Toggle mute/unmuted state for the videoPlayer
	 */
	handleMuteBtnPressed = () => {
		const videoPlayerIsMuted = this.state.videoPlayerIsMuted
		this.setState ( { videoPlayerIsMuted: !videoPlayerIsMuted } )
	}

	/**
	 * Handle the event where a user clicks anywhere on the videoPlayers' seekbar
	 * and seek to the corresponding time in the video
	 * @param clickEvent
	 * @param videoDuration
	 * @param videoIsPlaying
	 * @param emitNewPlayerStateToServer
	 * @param partyId
	 */
	handleSeekInVideo = ( clickEvent, videoDuration, videoIsPlaying, emitNewPlayerStateToServer, partyId ) => {
		const parentLeftMargin = clickEvent.target.getBoundingClientRect ().left
		const parentWidth = clickEvent.target.getBoundingClientRect ().width
		const mouseX = clickEvent.clientX
		const relativeMousePosition = mouseX - parentLeftMargin
		const amountOfSecondsAtXPos = videoUtils.pixelsToSeconds ( relativeMousePosition, parentWidth, videoDuration )

		emitNewPlayerStateToServer ( {
			playerState: videoIsPlaying ? 'playing' : 'paused',
			timeInVideo: amountOfSecondsAtXPos
		}, partyId )
	}

	/**
	 * Everytime the progress of the videoPlayer changes -> store the new videoProgress in the state
	 * @param event
	 */
	onPlayerProgress = ( event ) => {
		const { playedSeconds } = event

		this.setState ( { videoProgress: playedSeconds } )
	}

	/**
	 * Determine if this client is ready to play or not
	 * ( a client is ready [to play] if his playerState equals the parties' playerState )
	 * @param partyVideoPlayerState
	 * @param userVideoPlayerState
	 * @returns {{clientIsReady: boolean, timeInVideo: (*|number)}}
	 */
	determineClientReadyState = ( partyVideoPlayerState, userVideoPlayerState ) => {
		const timeInVideo = userVideoPlayerState.timeInVideo
		let clientIsReady = userVideoPlayerState.playerState === partyVideoPlayerState.playerState

		return {
			clientIsReady,
			timeInVideo
		}
	}

	/**
	 * Event listener for when this users' playerState changes
	 *
	 * 1. Determine if this client is ready to play or not ( == done buffering )
	 * 2. Let the server know if this client is ready to play or not by emitting an event
	 * Reason for debouncing: because Youtube always fires a pause event right before a buffering event,
	 * we want to ignore this first, useless pause event
	 */
	onPlayerStateChange = debounce ( ( partyVideoPlayerState, userVideoPlayerState, onClientReadyStateChange ) => {
		// If this users' videoPlayer somehow started playing, but the server is still telling us to pause
		// -> pause the videoPlayer for this user
		if ( partyVideoPlayerState.playerState === 'paused' && userVideoPlayerState.playerState === 'playing' ) {
			this.videoPlayer.getInternalPlayer ().pauseVideo ()
		}

		const clientReadyState = this.determineClientReadyState ( partyVideoPlayerState, userVideoPlayerState )
		onClientReadyStateChange ( clientReadyState )
	}, 500 )

	/**
	 * Returns a users' playerState object containing the playerState and timeInVideo
	 * @param playerState
	 * @param videoPlayer
	 * @returns {{playerState: *, timeInVideo}}
	 */
	constructUserPlayerState = ( playerState, videoPlayer ) => {
		return {
			playerState,
			timeInVideo: videoPlayer.getCurrentTime ()
		}
	}

	/**
	 * Render the videoPlayer
	 * @param selectedVideo
	 * @param partyVideoPlayerState
	 * @param onClientReadyStateChange
	 * @returns {XML}
	 */
	renderVideoPlayer = ( selectedVideo, partyVideoPlayerState, onClientReadyStateChange ) => {
		let videoUrl = videoUtils.getVideoUrl ( selectedVideo.videoSource, selectedVideo.id )
		const videoIsPlaying = partyVideoPlayerState.playerState === 'playing'
		const playerIsMuted = this.state.videoPlayerIsMuted

		return (
			<ReactPlayer
				url={ videoUrl }
				width={ '100%' }
				height={ '100%' }
				muted={ playerIsMuted }
				playing={ videoIsPlaying }
				ref={e => this.videoPlayer = e}
				onReady={() => this.setState ( { videoPlayerIsLoaded: true } )}
				onPlay={() => this.onPlayerStateChange (
					partyVideoPlayerState,
					this.constructUserPlayerState ( 'playing', this.videoPlayer ),
					onClientReadyStateChange
				)}
				onPause={() => this.onPlayerStateChange (
					partyVideoPlayerState,
					this.constructUserPlayerState ( 'paused', this.videoPlayer ),
					onClientReadyStateChange
				)}
				onBuffer={() => this.onPlayerStateChange (
					partyVideoPlayerState,
					this.constructUserPlayerState ( 'buffering', this.videoPlayer ),
					onClientReadyStateChange
				)}
				onProgress={ this.onPlayerProgress }
				config={{
					youtube: {
						playerVars: { showinfo: 1 }
					}
				}}
				style={ { position: 'absolute' } }
			/>
		)
	}

	render () {
		const {
			selectedVideo,
			partyVideoPlayerState,
			emitNewPlayerStateToServer,
			emitClientReadyStateToServer,
			videoPlayerIsMuted,
			setPlayerMutedState,
			partyId
		} = this.props

		const {
			videoPlayerIsLoaded,
			videoPlayerIsMaximized,
			videoProgress
		} = this.state

		const videoPlayer = this.videoPlayer
		const videoDuration = videoPlayerIsLoaded ? videoPlayer.getDuration() : null
		const videoPlayerClassNames = classNames ( 'video-player', {
			'maximized': videoPlayerIsMaximized
		} )

		return (
			<div className={videoPlayerClassNames}>
				{this.renderVideoPlayer ( selectedVideo, partyVideoPlayerState, emitClientReadyStateToServer )}

				<VideoPlayerControls
					partyVideoPlayerState={ partyVideoPlayerState }
					emitNewPlayerStateToServer={ emitNewPlayerStateToServer }
					partyId={ partyId }
					videoPlayerIsMuted={ videoPlayerIsMuted }
					videoPlayerIsMaximized={ videoPlayerIsMaximized }
					videoProgress={ videoProgress }
					videoDuration={ videoDuration }
					handlePlayBtnPressed={ this.handlePlayBtnPressed }
					handleMuteBtnPressed={ () => setPlayerMutedState ( !videoPlayerIsMuted ) }
					handleMaximizeBtnPressed={ this.handleMaximizeBtnPressed }
					handleSeekInVideo={ this.handleSeekInVideo }
				/>
			</div>
		)
	}
}

//=====================================
//  CONNECT
//-------------------------------------

const mapStateToProps = ( state ) => {
	return {
		videoPlayerIsMuted: state.videoPlayer.videoPlayerIsMuted,
	}
}

const mapDispatchToProps = {
	setPlayerMutedState: videoPlayerActions.setPlayerMutedState,
}

VideoPlayer = connect (
	mapStateToProps,
	mapDispatchToProps
) ( VideoPlayer )

export default VideoPlayer