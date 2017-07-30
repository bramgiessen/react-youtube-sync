// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// CSS
import './CreatePartyForm.css'

export default class CreatePartyForm extends Component {
	static propTypes = {
		creatingParty: PropTypes.bool.isRequired,
		cancelPartyButtonClickHandler: PropTypes.func.isRequired,
	}

	render () {
		const creatingParty = this.props.creatingParty

		const createPartyBlockCssClasses = classNames ( 'create-party-block', {
			'hidden': !creatingParty
		} );

		return (
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
				<div className="cancel-party button" onClick={this.props.cancelPartyButtonClickHandler}>Cancel</div>
			</div>
		)
	}
}