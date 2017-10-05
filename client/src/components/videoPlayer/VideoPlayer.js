// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import classNames from 'classnames'
import { debounce } from 'lodash'
import { videoUtils, generalUtils } from '../../core/utils'

// CSS
import './VideoPlayer.css'

export default class VideoPlayer extends Component {
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
			videoPlayerLoaded: false,
			videoProgress: 0
		}
	}

	componentDidUpdate ( prevProps, prevState ) {
		const { emitClientReadyStateToServer } = this.props
		const prevPartyPlayerState = prevProps.partyVideoPlayerState
		const currentPartyPlayerState = this.props.partyVideoPlayerState
		const internalVideoPlayer = this.videoPlayer.getInternalPlayer ()
		const videoPlayerLoaded = !!internalVideoPlayer

		// As soon as the videoPlayer is loaded, start listening for playerState commands from the server
		if ( videoPlayerLoaded ) {
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
	 * Toggle the maximization of the videoPlayer
	 */
	toggleVideoPlayerMaximized = () => {
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
	toggleVideoPlayerMuted = () => {
		const videoPlayerIsMuted = this.state.videoPlayerIsMuted
		this.setState ( { videoPlayerIsMuted: !videoPlayerIsMuted } )
	}

	/**
	 * Handle the event where a user clicks anywhere on the videoPlayers' seekbar
	 * and seek to the corresponding time in the video
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
	 * A client is ready [to play] if his playerState equals the parties' playerState
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
	 * Determine if this client is ready to play or not ( == done buffering ) and let the server know about this
	 *
	 * Reason for debouncing: because Youtube always fires a pause event right before a buffering event,
	 * we want to ignore this first, useless pause event
	 */
	onPlayerStateChange = debounce ( ( partyVideoPlayerState, userVideoPlayerState, onClientReady ) => {

		// If the users' videoPlayer somehow started playing, but the server is still telling us to pause
		// -> pause the videoPlayer
		if ( partyVideoPlayerState.playerState === 'paused' && userVideoPlayerState.playerState === 'playing' ) {
			this.videoPlayer.player.player.pauseVideo ()
		}
		const clientReadyState = this.determineClientReadyState ( partyVideoPlayerState, userVideoPlayerState )

		// Only if the users' playerState differs from the parties' playerState -> let the server know
		// if ( partyVideoPlayerState.playerState !== userVideoPlayerState.playerState ) {
		onClientReady ( clientReadyState )
		// }

	}, 500 )

	onPlayerProgress = ( event ) => {
		const { playedSeconds } = event

		this.setState ( { videoProgress: playedSeconds } )
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
	 * Render the right type of videoPlayer based on the videos' source
	 * @param selectedVideo
	 * @param partyVideoPlayerState
	 * @param onClientReady
	 * @returns {XML | null}
	 */
	renderVideoPlayer = ( selectedVideo, partyVideoPlayerState, onClientReady ) => {
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
				onReady={() => this.setState ( { videoPlayerLoaded: true } )}
				onPlay={() => this.onPlayerStateChange (
					partyVideoPlayerState,
					this.constructUserPlayerState ( 'playing', this.videoPlayer ),
					onClientReady
				)}
				onPause={() => this.onPlayerStateChange (
					partyVideoPlayerState,
					this.constructUserPlayerState ( 'paused', this.videoPlayer ),
					onClientReady
				)}
				onBuffer={() => this.onPlayerStateChange (
					partyVideoPlayerState,
					this.constructUserPlayerState ( 'buffering', this.videoPlayer ),
					onClientReady
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

	handlePlayBtnPressed = ( emitNewPlayerStateToServer, progressInSeconds, videoIsPlaying, partyId ) => {
		emitNewPlayerStateToServer ( {
			playerState: videoIsPlaying ? 'paused' : 'playing',
			timeInVideo: progressInSeconds
		}, partyId )
	}

	/**
	 * Render an overlay with custom videoPlayer controls
	 * @returns {Boolean | XML}
	 */
	renderVideoPlayerControlsOverlay = ( videoPlayer, partyVideoPlayerState, emitNewPlayerStateToServer, partyId ) => {
		if ( !videoPlayer ) {
			return false
		}
		const videoIsPlaying = partyVideoPlayerState.playerState === 'playing'
		const videoIsMuted = this.state.videoPlayerIsMuted
		const videoIsMaximized = this.state.videoPlayerIsMaximized
		const progressBarWidth = this.progressBar ? this.progressBar.offsetWidth : null
		const progressInSeconds = this.state.videoProgress
		const progressInPixels = videoUtils.secondsToPixels ( progressInSeconds, progressBarWidth, videoPlayer.getDuration () )
		const formattedProgressString = generalUtils.toHHMMSS ( progressInSeconds )

		const playBtnClassNames = classNames ( 'player-btn btn-left fa', {
			'fa-pause': videoIsPlaying,
			'fa-play': !videoIsPlaying
		} )
		const muteBtnClassNames = classNames ( 'player-btn btn-left fa', {
			'fa-volume-off': videoIsMuted,
			'fa-volume-up': !videoIsMuted
		} )
		const maximizeBtnClassNames = classNames ( 'player-btn btn-right fa', {
			'fa-minus-square-o': videoIsMaximized,
			'fa-arrows-alt': !videoIsMaximized
		} )

		return (
			<div className="player-controls-overlay"
				 onClick={ () => this.handlePlayBtnPressed ( emitNewPlayerStateToServer, progressInSeconds, videoIsPlaying, partyId )}>

				<div className="control-bar bottom" onClick={( event ) => event.stopPropagation ()}>

					<div className="progress-bar" onClick={ ( event ) => {
						this.handleSeekInVideo (
							event,
							videoPlayer.getDuration (),
							videoIsPlaying,
							emitNewPlayerStateToServer,
							partyId
						)
					} } ref={e => {
						this.progressBar = e
					}}>
						<div className="background-bar"></div>
						<div className="progress-indicator" style={{ left: progressInPixels }}></div>
					</div>

					<div className="control-buttons">
						<span className={ playBtnClassNames }
							  onClick={ (  ) =>
								  this.handlePlayBtnPressed (
									  emitNewPlayerStateToServer,
									  progressInSeconds,
									  videoIsPlaying,
									  partyId
								  )
							  }/>
						<span className={muteBtnClassNames} onClick={ this.toggleVideoPlayerMuted }/>
						<span className="current-time">{formattedProgressString}</span>

						<span className={maximizeBtnClassNames} onClick={ this.toggleVideoPlayerMaximized }/>
					</div>
				</div>
			</div>
		)
	}

	render () {
		const { selectedVideo, partyVideoPlayerState, emitNewPlayerStateToServer, emitClientReadyStateToServer, partyId, userName } = this.props
		const { videoPlayerIsMaximized } = this.state
		const videoPlayer = this.videoPlayer

		const videoPlayerClassNames = classNames ( 'video-player', {
			'maximized': videoPlayerIsMaximized
		} )

		return (
			<div className={videoPlayerClassNames}>
				{this.renderVideoPlayer ( selectedVideo, partyVideoPlayerState, emitClientReadyStateToServer )}
				{this.renderVideoPlayerControlsOverlay ( videoPlayer, partyVideoPlayerState, emitNewPlayerStateToServer, partyId )}
			</div>
		)
	}
}