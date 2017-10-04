// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import classNames from 'classnames'
import { videoUtils, generalUtils } from '../../core/utils'

// CSS
import './VideoPlayer.css'

export default class VideoPlayer extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		onPlayerStateChange: PropTypes.func.isRequired,
		partyId: PropTypes.string.isRequired,
		videoPlayer: PropTypes.object.isRequired,
		fullWidth: PropTypes.bool,
		userName: PropTypes.string
	}

	constructor ( props ) {
		super ( props )
		this.state = {
			videoPlayerIsMuted: false,
			videoPlayerIsMaximized: false,
		}
	}

	componentDidMount() {

	}

	componentDidUpdate ( prevProps, prevState ) {
		// console.log(this.videoPlayer.getInternalPlayer())
		// const videoPlayer = this.videoPlayer && this.videoPlayer.internalPlayer

		// If the player state has been changed by someone else in the party and there is more than a 2 sec difference ->
		// update the player position
		if ( prevProps.videoPlayer !== this.props.videoPlayer ) {
			this.videoPlayer.seekTo ( this.props.videoPlayer.timeInVideo )
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

	toggleVideoPlayerPlaying = ( currentPlayerState, currentTimeInVideo, onPlayerStateChange, partyId ) => {
		if ( currentPlayerState === 'paused' ) {
			onPlayerStateChange (
				'playing',
				currentTimeInVideo,
				partyId )
		} else {
			onPlayerStateChange (
				'paused',
				currentTimeInVideo,
				partyId )
		}
	}

	setClientIsReadyToPlay = (bool, timeInVideo, notifyServer, partyId) => {
		const clientStatus = bool ? 'ready' : 'buffering'

		console.log(clientStatus)
		notifyServer (
			clientStatus,
			timeInVideo,
			partyId )
	}

	/**
	 * Render the right type of videoPlayer based on the videos' source
	 * @param videoId
	 * @param videoSource
	 * @returns {XML | null}
	 */
	renderVideoPlayer = ( selectedVideo, videoPlayer, onPlayerStateChange, partyId ) => {
		let videoUrl = videoUtils.getVideoUrl ( selectedVideo.videoSource, selectedVideo.id )
		const videoIsPlaying = videoPlayer.playerState === 'playing'
		const playerIsMuted = this.state.videoPlayerIsMuted

		console.log(videoIsPlaying)

		return (
			<ReactPlayer
				url={ videoUrl }
				width={ '100%' }
				height={ '100%' }
				muted={ playerIsMuted }
				playing={ videoIsPlaying }
				ref={e => this.videoPlayer = e}
				onPlay={() => this.setClientIsReadyToPlay(
					true,
					this.videoPlayer.getCurrentTime (),
					onPlayerStateChange,
					partyId
				)}
				onBuffer={() => this.setClientIsReadyToPlay(
					false,
					this.videoPlayer.getCurrentTime (),
					onPlayerStateChange,
					partyId
				)}
				config={{
					youtube: {
						playerVars: { showinfo: 1 }
					}
				}}
				style={ { position: 'absolute' } }
			/>
		)
	}

	/**
	 * Render an overlay with custom videoPlayer controls
	 * @returns {XML}
	 */
	renderVideoPlayerControlsOverlay = ( videoPlayer, onPlayerStateChange, partyId ) => {
		const videoIsPlaying = videoPlayer.playerState === 'playing'
		const videoIsMuted = this.state.videoPlayerIsMuted
		const videoIsMaximized = this.state.videoPlayerIsMaximized

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
			<div className="player-controls-overlay">
				<div className="control-bar bottom">
					<span className={playBtnClassNames}
						  onClick={ () =>
							  this.toggleVideoPlayerPlaying (
								  videoPlayer.playerState,
								  this.videoPlayer.getCurrentTime (),
								  onPlayerStateChange,
								  partyId
							  )
						  }/>
					<span className={muteBtnClassNames} onClick={ this.toggleVideoPlayerMuted }/>

					<span className={maximizeBtnClassNames} onClick={ this.toggleVideoPlayerMaximized }/>
				</div>
			</div>
		)
	}

	/**
	 * Render a Youtube video player
	 * @param videoId
	 * @returns {XML}
	 */
	// renderYoutubeVideoPlayer = ( selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName ) => {
	// 	const userIsLoggedIn = !!userName
	//
	// 	const opts = {
	// 		height: '100%',
	// 		width: '100%',
	// 		playerVars: { // https://developers.google.com/youtube/player_parameters
	// 			autoplay: videoPlayer.playerState === 'playing' ? 1 : 0,
	// 			controls: userIsLoggedIn ? 1 : 0 // Only show controls if the user is logged in
	// 		}
	// 	}
	//
	// 	return (
	// 		<YoutubePlayer
	// 			videoId={selectedVideo.id}
	// 			opts={opts}
	// 			ref={e => this.videoPlayer = e}
	// 			onStateChange={
	// 				( event ) => {
	// 					onPlayerStateChange (
	// 						videoUtils.getYoutubePlayerState ( event ),
	// 						event.target.getCurrentTime (),
	// 						partyId )
	// 				}
	// 			}
	// 		/>
	// 	)
	// }

	render () {
		const { selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName } = this.props
		const { videoPlayerIsMaximized } = this.state

		const videoPlayerClassNames = classNames ( 'video-player', {
			'maximized': videoPlayerIsMaximized
		} )

		return (
			<div className={videoPlayerClassNames}>
				{this.renderVideoPlayer ( selectedVideo, videoPlayer, onPlayerStateChange, partyId )}
				{this.renderVideoPlayerControlsOverlay ( videoPlayer, onPlayerStateChange, partyId )}
			</div>
		)
	}
}