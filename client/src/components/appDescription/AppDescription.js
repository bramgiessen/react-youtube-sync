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
		creatingUserName: PropTypes.bool.isRequired,
		startButtonClickHandler: PropTypes.func.isRequired,
	}

	render () {
		const { creatingUserName, startButtonClickHandler } = this.props

		// Hide the app description if the user is in the process of creating a party
		const descriptionBlockCssClasses = classNames ( 'app-description-block', {
			'hidden': creatingUserName
		} )

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

				<div className="start-button" onClick={startButtonClickHandler}>Start watching !</div>
			</div>
		)
	}
}