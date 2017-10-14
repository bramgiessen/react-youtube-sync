// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Truncate from 'react-truncate'
import { videoUtils } from '../../core/utils/index'

// CSS
import './VideoCard.css'

export default class VideoCard extends Component {
	static propTypes = {
		video: PropTypes.object.isRequired,
		videoSource: PropTypes.string.isRequired,
		handleVideoSelection: PropTypes.func.isRequired
	}


	render () {
		const { video, videoSource, handleVideoSelection } = this.props
		const videoDetails = videoUtils.getVideoDetails ( video, videoSource )

		return (
			<div className="video-card g-col card"
				 title={videoDetails.title}
				 onClick={() => {
					 handleVideoSelection ( videoDetails, videoSource )
				 }}>

				<div className="card-content">

					<div className="thumbnail">
						<img src={videoDetails.thumbnailSrc} alt="Video thumbnail"/>
						<div className="video-description">
							<Truncate lines={4} ellipsis='...'>
								{videoDetails.description}
							</Truncate>
						</div>
					</div>
					<div className="main">
						<h1 className="video-title">
							<Truncate lines={2} ellipsis='...'>
								{videoDetails.title}
							</Truncate>
						</h1>
					</div>

				</div>

			</div>
		)
	}
}