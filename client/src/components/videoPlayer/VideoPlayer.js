// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactPlayer from 'react-player'
import classNames from 'classnames'
import { videoUtils } from '../../core/utils'

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
		userVideoPlayerState: PropTypes.object.isRequired,
		partyVideoPlayerState: PropTypes.object.isRequired,
		onPlayerStateChange: PropTypes.func.isRequired,
		emitNewPlayerStateToServer: PropTypes.func.isRequired,
		setPlayerMutedState: PropTypes.func.isRequired,
		setPlayerProgress: PropTypes.func.isRequired,
		setPlayerIsLoadedState: PropTypes.func.isRequired,
		handleMaximizeBtnPressed: PropTypes.func.isRequired,
	}

	constructor (props) {
		super (props)
		const { setPlayerIsLoadedState } = props

		// Initially -> always make sure that the videoPlayerLoaded state is
		// reset to false
		setPlayerIsLoadedState ( false )
	}

	componentDidUpdate ( prevProps, prevState ) {
		const { videoPlayerIsLoaded, userVideoPlayerState } = this.props
		const prevPartyPlayerState = prevProps.partyVideoPlayerState
		const currentPartyPlayerState = this.props.partyVideoPlayerState
		const userIsBuffering = userVideoPlayerState.playerState === 'buffering'
		const internalVideoPlayer = this.videoPlayer.getInternalPlayer ()

		// As soon as the videoPlayer is loaded, start listening for playerState commands from the server
		if ( videoPlayerIsLoaded && internalVideoPlayer && !userIsBuffering ) {
			this.handlePauseVideoCommandsFromServer ( currentPartyPlayerState, internalVideoPlayer )
			this.handleSeekToCommandsFromServer ( prevPartyPlayerState, currentPartyPlayerState, internalVideoPlayer )
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
		if ( partyPlayerStateUpdated && currentPartyPlayerState.timeInVideo !== 0  ) {
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
	 * @param videoPlayerIsMuted
	 * @param partyVideoPlayerState
	 * @param onClientReadyStateChange
	 * @param onPlayerProgress
	 * @param setPlayerIsLoadedState
	 * @returns {XML}
	 */
	renderVideoPlayer = ( selectedVideo, videoPlayerIsMuted, partyVideoPlayerState, onPlayerStateChange, onPlayerProgress, setPlayerIsLoadedState ) => {
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
				onPlay={() => onPlayerStateChange (
					this.constructUserPlayerState ( 'playing', this.videoPlayer ),
				)}
				onPause={() => onPlayerStateChange (
					this.constructUserPlayerState ( 'paused', this.videoPlayer ),
				)}
				onBuffer={() => onPlayerStateChange (
					this.constructUserPlayerState ( 'buffering', this.videoPlayer ),
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
			onPlayerStateChange,
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
		const videoDuration = videoPlayer && videoPlayerIsLoaded ? videoPlayer.getDuration () : null
		const videoPlayerClassNames = classNames ( 'video-player', {
			'maximized': videoPlayerIsMaximized
		} )

		return (
			<div className={videoPlayerClassNames}>
				{ this.renderVideoPlayer (
					selectedVideo,
					videoPlayerIsMuted,
					partyVideoPlayerState,
					onPlayerStateChange,
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