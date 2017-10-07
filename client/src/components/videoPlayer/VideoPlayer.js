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

export default class VideoPlayer extends Component {

	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		partyId: PropTypes.string.isRequired,
		userName: PropTypes.string,
		videoPlayerIsMuted: PropTypes.bool,
		videoPlayerIsMaximized: PropTypes.bool,
		videoPlayerIsLoaded: PropTypes.bool,
		videoProgress: PropTypes.number.isRequired,
		partyVideoPlayerState: PropTypes.object.isRequired,
		emitClientReadyStateToServer: PropTypes.func.isRequired,
		emitNewPlayerStateToServer: PropTypes.func.isRequired,
		setPlayerMutedState: PropTypes.func.isRequired,
		setPlayerProgress: PropTypes.func.isRequired,
		setPlayerIsLoadedState: PropTypes.func.isRequired,
		handleMaximizeBtnPressed: PropTypes.func.isRequired,
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
	 * Determine if this client is ready to play or not
	 * ( a client is ready [to play] if his playerState is equal to the parties' playerState )
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
	 * Render the videoPlayer
	 * @param selectedVideo
	 * @param videoPlayerIsMuted
	 * @param partyVideoPlayerState
	 * @param onClientReadyStateChange
	 * @param onPlayerProgress
	 * @param setPlayerIsLoadedState
	 * @returns {XML}
	 */
	renderVideoPlayer = ( selectedVideo, videoPlayerIsMuted, partyVideoPlayerState, onClientReadyStateChange, onPlayerProgress, setPlayerIsLoadedState ) => {
		let videoUrl = videoUtils.getVideoUrl ( selectedVideo.videoSource, selectedVideo.id )
		const videoIsPlaying = partyVideoPlayerState.playerState === 'playing'

		return (
			<ReactPlayer
				url={ videoUrl }
				width={ '100%' }
				height={ '100%' }
				muted={ videoPlayerIsMuted }
				playing={ videoIsPlaying }
				ref={e => this.videoPlayer = e}
				onReady={() => setPlayerIsLoadedState ( true )}
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
				onProgress={ onPlayerProgress }
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
			setPlayerProgress,
			videoPlayerIsMuted,
			videoPlayerIsMaximized,
			videoPlayerIsLoaded,
			setPlayerMutedState,
			setPlayerIsLoadedState,
			handleMaximizeBtnPressed,
			videoProgress,
			partyId
		} = this.props

		const videoPlayer = this.videoPlayer
		const videoDuration = videoPlayerIsLoaded ? videoPlayer.getDuration () : null
		const videoPlayerClassNames = classNames ( 'video-player', {
			'maximized': videoPlayerIsMaximized
		} )

		return (
			<div className={videoPlayerClassNames}>
				{ this.renderVideoPlayer (
					selectedVideo,
					videoPlayerIsMuted,
					partyVideoPlayerState,
					emitClientReadyStateToServer,
					setPlayerProgress,
					setPlayerIsLoadedState ) }

				<VideoPlayerControls
					partyVideoPlayerState={ partyVideoPlayerState }
					emitNewPlayerStateToServer={ emitNewPlayerStateToServer }
					partyId={ partyId }
					videoPlayerIsMuted={ videoPlayerIsMuted }
					videoPlayerIsMaximized={ videoPlayerIsMaximized }
					videoProgress={ videoProgress }
					videoDuration={ videoDuration }
					handleMuteBtnPressed={ () => setPlayerMutedState ( !videoPlayerIsMuted ) }
					handleMaximizeBtnPressed={ () => handleMaximizeBtnPressed (
						videoPlayerIsMaximized,
						document.getElementsByClassName ( 'video-player' )[ 0 ]
					) }
				/>
			</div>
		)
	}
}