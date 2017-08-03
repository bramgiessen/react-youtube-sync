// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import YoutubePlayer from 'react-youtube'

// CSS
import './VideoPlayer.css'

export default class VideoPlayer extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired
	}

	/**
	 * Render the right type of videoPlayer based on the videos' source
	 * @param videoId
	 * @param videoSource
	 * @returns {null}
	 */
	renderVideoPlayer = ( videoId, videoSource ) => {
		switch ( videoSource ) {
			case 'youtube':
				return this.renderYoutubeVideoPlayer ( videoId )
			default:
				return null
		}
	}

	/**
	 * Render a Youtube video player
	 * @param videoId
	 * @returns {XML}
	 */
	renderYoutubeVideoPlayer = ( videoId ) => {
		const opts = {
			height: '100%',
			width: '100%',
			playerVars: { // https://developers.google.com/youtube/player_parameters
				autoplay: 1
			}
		}

		return (
			<YoutubePlayer
				videoId={videoId}
				opts={opts}
			/>
		)
	}

	render () {
		const { selectedVideo } = this.props

		return (
			<div className="video-player">
				{this.renderVideoPlayer ( selectedVideo.videoId, selectedVideo.videoSource )}
			</div>
		)
	}
}