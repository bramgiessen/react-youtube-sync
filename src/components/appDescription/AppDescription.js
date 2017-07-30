// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// Assets
import screenImg from '../../assets/media_screen.svg'
import syncImg from '../../assets/sync_icon.svg'

// CSS
import './AppDescription.css'

export default class AppDescription extends Component {
	static propTypes = {
		creatingParty: PropTypes.bool.isRequired,
		startPartyButtonClickHandler: PropTypes.func.isRequired,
	}

	render () {
		const creatingParty = this.props.creatingParty

		const descriptionBlockCssClasses = classNames ( 'app-description-block', {
			'hidden': creatingParty
		} );

		return (
			<div className={descriptionBlockCssClasses}>
				<div className="welcome-header">Welcome to Youtube Video Party !</div>

				<div className="infographic">
					<img src={screenImg} className="infographic-screen left" alt="Screen illustration"/>
					<img src={syncImg} className="infographic-sync rotating" alt="Synchronization icon"/>
					<img src={screenImg} className="infographic-screen right" alt="Screen illustration"/>
				</div>

				<span className="tagline">The easiest way to watch Youtube videos together in <i>perfect sync</i>,
								across multiple browsers / devices !</span>

				<div className="tutorial">
					<span className="tutorial-header">How? It's easy! Just follow these steps:</span>

					<ol className="tutorial-steps">
						<li>Choose a username</li>
						<li>Choose a video</li>
						<li>Share the special generated url with your friends and start watching together!</li>
					</ol>
				</div>

				<div className="start-button" onClick={this.props.startPartyButtonClickHandler}>Start watching !</div>
			</div>
		)
	}
}