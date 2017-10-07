// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { videoUtils, generalUtils } from '../../core/utils'
import classNames from 'classnames'

// CSS
import './VideoPlayerControls.css'

export default class VideoPlayerControls extends Component {
	static propTypes = {
		partyVideoPlayerState: PropTypes.object.isRequired,
		emitNewPlayerStateToServer: PropTypes.func.isRequired,
		partyId: PropTypes.string.isRequired,
		videoPlayerIsMuted: PropTypes.bool.isRequired,
		videoPlayerIsMaximized: PropTypes.bool.isRequired,
		videoProgress: PropTypes.number.isRequired,
		videoDuration: PropTypes.number,
		handlePlayBtnPressed: PropTypes.func.isRequired,
		handleMuteBtnPressed: PropTypes.func.isRequired,
		handleMaximizeBtnPressed: PropTypes.func.isRequired,
		handleSeekInVideo: PropTypes.func.isRequired,
	}

	render () {
		const {
			partyVideoPlayerState,
			emitNewPlayerStateToServer,
			partyId,
			videoPlayerIsMuted,
			videoPlayerIsMaximized,
			videoProgress,
			videoDuration,
			handlePlayBtnPressed,
			handleMuteBtnPressed,
			handleMaximizeBtnPressed,
			handleSeekInVideo,
		} = this.props

		if ( !videoDuration ) {
			return false
		}
		const videoIsPlaying = partyVideoPlayerState.playerState === 'playing'
		const videoIsMuted = videoPlayerIsMuted
		const videoIsMaximized = videoPlayerIsMaximized
		const progressBarWidth = this.progressBar ? this.progressBar.offsetWidth : null
		const progressInSeconds = videoProgress
		const progressInPixels = videoUtils.secondsToPixels ( progressInSeconds, progressBarWidth, videoDuration )
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
				 onClick={ () => handlePlayBtnPressed ( emitNewPlayerStateToServer, progressInSeconds, videoIsPlaying, partyId )}>

				<div className="control-bar bottom" onClick={( event ) => event.stopPropagation ()}>

					<div className="progress-bar" ref={ e => { this.progressBar = e } }
						 onClick={ ( event ) => {
							 handleSeekInVideo (
								 event,
								 videoDuration,
								 videoIsPlaying,
								 emitNewPlayerStateToServer,
								 partyId
							 )
						 } }>
						<div className="background-bar"></div>
						<div className="progress-indicator" style={{ left: progressInPixels }}></div>
					</div>

					<div className="control-buttons">
						<span className={ playBtnClassNames }
							  onClick={ () =>
								  handlePlayBtnPressed (
									  emitNewPlayerStateToServer,
									  progressInSeconds,
									  videoIsPlaying,
									  partyId
								  )
							  }/>
						<span className={muteBtnClassNames} onClick={ handleMuteBtnPressed }/>
						<span className="current-time">{formattedProgressString}</span>

						<span className={maximizeBtnClassNames} onClick={ handleMaximizeBtnPressed }/>
					</div>
				</div>
			</div>
		)
	}
}