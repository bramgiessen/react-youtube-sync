// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// CSS
import './SetUserNamePopup.css'

export default class SetUserNamePopup extends Component {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		handleSetUserName: PropTypes.func.isRequired
	}

	render () {
		const { isVisible, handleSetUserName } = this.props

		// Hide the createUserName block if the user is not in the process of creating a username
		const setUserNamePopupCssClasses = classNames ( 'set-username-popup-wrapper', {
			'hidden': !isVisible
		} )

		return (
			<div className={setUserNamePopupCssClasses}>
				<div className="set-username-popup">
					<span className="create-username-header">Who are you ?</span>
					<span className="create-username-description">Let other people know who you are by choosing a display / username</span>

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

					<div className="create-username button" onClick={() => {
						handleSetUserName ( this.input.value.trim () )
					}}>Continue
					</div>
				</div>
			</div>
		)
	}
}