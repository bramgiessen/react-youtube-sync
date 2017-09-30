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
		videoPlayer: PropTypes.object.isRequired,
		fullWidth: PropTypes.bool,
		userName: PropTypes.string
	}

	componentDidUpdate ( prevProps, prevState ) {
		const videoPlayer = this.videoPlayer && this.videoPlayer.internalPlayer

		// If the player state has been changed by someone else in the party and there is more than a 2 sec difference ->
		// update the player position
		if ( prevProps.videoPlayer !== this.props.videoPlayer ) {

			videoPlayer.seekTo ( this.props.videoPlayer.timeInVideo )
			if ( this.props.videoPlayer.playerState !== 'playing' ) {
				videoPlayer.pauseVideo ()
			} else {
				videoPlayer.playVideo ()
			}
		}

	}

	/**
	 * Render the right type of videoPlayer based on the videos' source
	 * @param videoId
	 * @param videoSource
	 * @returns {XML | null}
	 */
	renderVideoPlayer = ( selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName ) => {
		switch ( selectedVideo.videoSource ) {
			case 'youtube':
				return this.renderYoutubeVideoPlayer ( selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName )
			default:
				return null
		}
	}

	/**
	 * Render a Youtube video player
	 * @param videoId
	 * @returns {XML}
	 */
	renderYoutubeVideoPlayer = ( selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName ) => {
		const userIsLoggedIn = !!userName

		const opts = {
			height: '100%',
			width: '100%',
			playerVars: { // https://developers.google.com/youtube/player_parameters
				autoplay: videoPlayer.playerState === 'playing' ? 1 : 0,
				controls: userIsLoggedIn ? 1 : 0 // Only show controls if the user is logged in
			}
		}

		return (
			<YoutubePlayer
				videoId={selectedVideo.id}
				opts={opts}
				ref={e => this.videoPlayer = e}
				onStateChange={
					( event ) => {
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
		const { selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName } = this.props

		return (
			<div className="video-player">
				{this.renderVideoPlayer ( selectedVideo, videoPlayer, onPlayerStateChange, partyId, userName )}
			</div>
		)
	}
}