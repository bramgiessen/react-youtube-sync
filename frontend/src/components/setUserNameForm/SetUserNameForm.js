// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// CSS
import './SetUserNameForm.css'

export default class SetUserNameForm extends Component {
	static propTypes = {
		creatingUserName: PropTypes.bool.isRequired,
		cancelButtonClickHandler: PropTypes.func.isRequired,
		handleSetUserName: PropTypes.func.isRequired,
	}

	render () {
		const { creatingUserName, cancelButtonClickHandler } = this.props

		// Hide the createUserName block if the user is not in the process of creating a username
		const createUserNameBlockCssClasses = classNames ( 'create-username-block', {
			'hidden': !creatingUserName
		} )

		return (
			<div className={createUserNameBlockCssClasses}>
				<span className="create-username-header">Who are you ?</span>
				<span className="create-username-description">Choose a username so that other people in your party will know who you are</span>

				<div className="username-details">

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
				
				<div className="create-username button" onClick={() => {this.props.handleSetUserName(this.input.value.trim ())}}>Continue</div>
				<div className="cancel-username button" onClick={cancelButtonClickHandler}>Cancel</div>
			</div>
		)
	}
}