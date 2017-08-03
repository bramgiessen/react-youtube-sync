// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './VideoList.css'

// Components
import LoadingIndicator from '../../components/loadingIndicator/LoadingIndicator'
import VideoCard from '../../components/videoCard/VideoCard'

export default class VideoList extends Component {
	static propTypes = {
		youtubeVideos: PropTypes.array.isRequired,
		showLoadingAnimation: PropTypes.bool.isRequired
	}

	/**
	 * Render function to render youtube video cards
	 * @param youtubeVideos
	 * @returns {*|Object|Array}
	 */
	renderVideoCard = ( videos, source ) => {
		return (
			videos.map ( ( video, index ) => {
				return (
					<VideoCard
						key={index}
						videoSource={source}
						video={video}
					/>
				)
			} )
		)
	}

	render () {
		const { youtubeVideos, showLoadingAnimation } = this.props

		return (
			<div className="video-list">
				<LoadingIndicator
					showLoadingAnnimation={showLoadingAnimation}
				/>

				{this.renderVideoCard ( youtubeVideos, 'youtube' )}

			</div>
		)
	}
}