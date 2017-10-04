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
		}
	}

	componentDidMount () {

	}

	componentDidUpdate ( prevProps, prevState ) {
		const prevPartyPlayerState = prevProps.partyVideoPlayerState
		const currentPartyPlayerState = this.props.partyVideoPlayerState
		const internalVideoPlayer = this.videoPlayer.getInternalPlayer ()

		// If the player state has been changed by someone else in the party and there is more than a 2 sec difference ->
		// update the player position
		if ( prevPartyPlayerState !== currentPartyPlayerState ) {
			this.videoPlayer.seekTo ( currentPartyPlayerState.timeInVideo )

			// If the videoPlayer was already paused
			if ( internalVideoPlayer
				&& prevPartyPlayerState.playerState === 'paused' && currentPartyPlayerState.playerState === 'paused'
				&& prevPartyPlayerState.timeInVideo === currentPartyPlayerState.timeInVideo ) {
				this.props.emitClientReadyStateToServer ( {clientIsReady:true, timeInVideo:currentPartyPlayerState.timeInVideo } )
			}
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

		console.log ( userVideoPlayerState )

		// If the users' videoPlayer somehow started playing, but the server is still telling us to pause
		// -> pause the videoPlayer
		if ( partyVideoPlayerState.playerState === 'paused' && userVideoPlayerState.playerState === 'playing' ) {
			this.videoPlayer.player.player.pauseVideo ()
		}
		const clientReadyState = this.determineClientReadyState ( partyVideoPlayerState, userVideoPlayerState )


		if ( !(partyVideoPlayerState.playerState === 'playing' && userVideoPlayerState.playerState === 'playing') ) {
			onClientReady ( clientReadyState )
		}

	}, 50 )

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
				onError={() => {
					console.log ( 'onseek' )
				}}
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
	renderVideoPlayerControlsOverlay = ( partyVideoPlayerState, emitNewPlayerStateToServer, partyId ) => {
		const videoIsPlaying = partyVideoPlayerState.playerState === 'playing'
		// const videoIsPlaying = this.state.videoPlayerIsPlaying
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
					<span className={ playBtnClassNames }
						  onClick={ () => emitNewPlayerStateToServer ( {
							  playerState: videoIsPlaying ? 'paused' : 'playing',
							  timeInVideo: this.videoPlayer.getCurrentTime ()
						  }, partyId )
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
		const { selectedVideo, partyVideoPlayerState, emitNewPlayerStateToServer, emitClientReadyStateToServer, partyId, userName } = this.props
		const { videoPlayerIsMaximized } = this.state

		const videoPlayerClassNames = classNames ( 'video-player', {
			'maximized': videoPlayerIsMaximized
		} )

		return (
			<div className={videoPlayerClassNames}>
				{this.renderVideoPlayer ( selectedVideo, partyVideoPlayerState, emitClientReadyStateToServer )}
				{this.renderVideoPlayerControlsOverlay ( partyVideoPlayerState, emitNewPlayerStateToServer, partyId )}
			</div>
		)
	}
}