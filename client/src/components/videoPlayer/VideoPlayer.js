// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import YoutubePlayer from 'react-youtube'
import { videoUtils } from '../../core/utils/index'

// CSS
import './VideoPlayer.css'

export default class VideoPlayer extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired,
		onPlayerStateChange: PropTypes.func.isRequired,
		partyId: PropTypes.string.isRequired,
		playerState: PropTypes.object.isRequired,
		fullWidth: PropTypes.bool,
        userName: PropTypes.string
	}

	constructor(props) {
		super(props);
		this.state = {
			playerStateModifiedExternally : false
		}
	}

	componentDidUpdate(prevProps, prevState){
		const videoPlayer = this.videoPlayer && this.videoPlayer.internalPlayer

		// If the player state has been changed by someone else in the party and there is more than a 2 sec difference ->
		// update the player position
		if(prevProps.playerState.playerState !== this.props.playerState.playerState
				|| (Math.abs(prevProps.playerState.timeInVideo - this.props.playerState.timeInVideo) > 2)){

			videoPlayer.seekTo(this.props.playerState.timeInVideo)
			if(this.props.playerState.playerState !== 'playing'){
				videoPlayer.pauseVideo()
			}else{
				videoPlayer.playVideo()
			}

		}

	}

	/**
	 * Render the right type of videoPlayer based on the videos' source
	 * @param videoId
	 * @param videoSource
	 * @returns {XML | null}
	 */
	renderVideoPlayer = ( videoId, videoSource, onPlayerStateChange, partyId, userName ) => {
		switch ( videoSource ) {
			case 'youtube':
				return this.renderYoutubeVideoPlayer ( videoId, onPlayerStateChange, partyId, userName )
			default:
				return null
		}
	}

	/**
	 * Render a Youtube video player
	 * @param videoId
	 * @returns {XML}
	 */
	renderYoutubeVideoPlayer = ( videoId, onPlayerStateChange, partyId, userName ) => {
		const userIsLoggedIn = !!userName

		const opts = {
			height: '100%',
			width: '100%',
			playerVars: { // https://developers.google.com/youtube/player_parameters
				autoplay: 0,
				controls: userIsLoggedIn ? 1 : 0 // Only show controls if the user is logged in
			}
		}

		return (
			<YoutubePlayer
				videoId={videoId}
				opts={opts}
				ref={e => this.videoPlayer = e}
				onStateChange={
					( event ) => {
						console.log(event)
						console.log(videoUtils.getYoutubePlayerState ( event ))

						onPlayerStateChange (
						videoUtils.getYoutubePlayerState ( event ),
						event.target.getCurrentTime (),
						partyId )
					}
				}
			/>
		)
	}

	render () {
		console.log(this.props)
		const { selectedVideo, onPlayerStateChange, partyId, userName } = this.props
		const { id, videoSource } = selectedVideo


		return (
			<div className="video-player">
				{this.renderVideoPlayer ( id, videoSource, onPlayerStateChange, partyId, userName )}
			</div>
		)
	}
}