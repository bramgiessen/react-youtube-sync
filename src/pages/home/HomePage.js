// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Assets
import screenImg from '../../assets/media_screen.svg'
import syncImg from '../../assets/sync_icon.svg'

// CSS
import './HomePage.css'

export default class HomePage extends Component {
	static propTypes = {}

	render () {
		return (
			<div className="home-page">
				<div className="g-row">
					<div className="g-col">
						<div className="app-description">
							<span className="welcome-header">Welcome to Youtube Video Party !</span>

							<div className="infographic">
								<img src={screenImg} className="infographic-screen left" alt="Screen illustration"/>
								<img src={syncImg} className="infographic-sync rotating" alt="Synchronization icon"/>
								<img src={screenImg} className="infographic-screen right" alt="Screen illustration"/>
							</div>

							<span className="tagline">The easiest way to watch Youtube videos together in <i>perfect sync</i>,
								across multiple browsers / devices !</span>

							<div className="start-button">Start a Youtube Video Party !</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}