// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';

// Assets
import screenImg from '../../assets/media_screen.svg'
import syncImg from '../../assets/sync_icon.svg'

// CSS
import './HomePage.css'

export default class HomePage extends Component {
	static propTypes = {}

	constructor ( props ) {
		super ( props )
		this.state = {
			creatingParty: false
		}
	}

	/**
	 * When the user presses the 'Start a Youtube Party' button
	 */
	startPartyButtonClickHandler = () => {
		this.setState ( { creatingParty: true } )
	}

	/**
	 * When the user cancels the creation of a party
	 */
	cancelPartyButtonClickHandler = () => {
		this.setState ( { creatingParty: false } )
	}

	render () {
		// Hide the initial application description / explanation when the user has pressed
		// the 'create party' button
		const descriptionBlockCssClasses = classNames ( 'app-description-block', {
			'hidden': this.state.creatingParty
		} );

		// Show the party creation form when the user has pressed
		// the 'create party' button
		const createPartyBlockCssClasses = classNames ( 'create-party-block', {
			'hidden': !this.state.creatingParty
		} );

		return (
			<div className="home-page">
				<div className="g-row">
					<div className="g-col">
						<div className={descriptionBlockCssClasses}>
							<span className="welcome-header">Welcome to Youtube Video Party !</span>

							<div className="infographic">
								<img src={screenImg} className="infographic-screen left" alt="Screen illustration"/>
								<img src={syncImg} className="infographic-sync rotating" alt="Synchronization icon"/>
								<img src={screenImg} className="infographic-screen right" alt="Screen illustration"/>
							</div>

							<span className="tagline">The easiest way to watch Youtube videos together in <i>perfect sync</i>,
								across multiple browsers / devices !</span>

							<div className="start-button" onClick={this.startPartyButtonClickHandler}>Start watching !</div>
						</div>

						<div className={createPartyBlockCssClasses}>
							<span className="create-party-header">Who are you ?</span>
							<span className="create-party-description">Choose a username so that other people in your party will know who you are</span>

							<div className="party-details">

									<input
										ref={e => this.input = e}
										autoComplete="off"
										className="input user-name"
										maxLength="60"
										placeholder="Username / display name"
										tabIndex="0"
										type="text"
									/>
							</div>

							<div className="create-party button">Continue</div>
							<div className="cancel-party button" onClick={this.cancelPartyButtonClickHandler}>Cancel</div>
						</div>

					</div>
				</div>
			</div>
		)
	}
}