// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './MobileDevicePlayerDialog.css'

export default class MobileDevicePlayerDialog extends Component {
	static propTypes = {
		partyId: PropTypes.string.isRequired,
		videoPlayer: PropTypes.object,
		videoPlayerIsLoaded: PropTypes.bool.isRequired,
		partyVideoPlayerState: PropTypes.object.isRequired,
		emitNewPlayerStateToServer: PropTypes.func.isRequired
	}

	constructor ( props ) {
		super ( props )
		this.state = {
			videoPlayerStarted: false
		}
	}

	/**
	 * Start the videoPlayer when the user presses the 'Start videoplayer' button
	 * @param internalVideoPlayer
	 * @param partyVideoPlayerState
	 * @param emitNewPlayerStateToServer
	 * @param partyId
	 */
	startVideoPlayer = ( internalVideoPlayer, partyVideoPlayerState, emitNewPlayerStateToServer, partyId ) => {
		this.setState ( { videoPlayerStarted: true } )
		internalVideoPlayer.playVideo ()
		emitNewPlayerStateToServer ( {
			playerState: 'playing',
			timeInVideo: partyVideoPlayerState.timeInVideo
		}, partyId )
	}

	render () {
		const {
			partyId,
			videoPlayer,
			videoPlayerIsLoaded,
			partyVideoPlayerState,
			emitNewPlayerStateToServer
		} = this.props

		if ( videoPlayer && videoPlayerIsLoaded && !this.state.videoPlayerStarted ) {
			const internalVideoPlayer = videoPlayer.getInternalPlayer ()

			return (
				<div className="mobile-device-dialog-wrapper">
					<div className="mobile-device-dialog">
						<h1 className="header">Hi there!</h1>
						<span className="description">We see that you're on a mobile device, cool! We just need
							you to press the button below to start the videoplayer, have fun!</span>
						<div className="start-player-btn" onClick={() =>
							this.startVideoPlayer (
								internalVideoPlayer,
								partyVideoPlayerState,
								emitNewPlayerStateToServer,
								partyId
							)}>
							Start videoplayer
						</div>
					</div>
				</div>
			)
		} else {
			return null
		}
	}
}