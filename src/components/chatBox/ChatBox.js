// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

// CSS
import './ChatBox.css'

export default class ChatBox extends Component {
	static propTypes = {
		onMessageSend: PropTypes.func.isRequired,
		partyId: PropTypes.string.isRequired,
		userName: PropTypes.string,
		messagesInParty: PropTypes.array
	}

	componentDidMount () {
		this.messageBox.scrollTop = this.messageBox.scrollHeight
	}

	componentDidUpdate () {
		this.messageBox.scrollTop = this.messageBox.scrollHeight
	}

	renderMessages = ( messages ) => {
		const { userName } = this.props

		return (
			<div className="messages-wrapper">

				{messages.map ( ( message, index ) => {
					const cssClasses = classNames ( 'message', {
						'self': userName === message.userName
					} )

					return (
						<div className="message-wrapper" key={index}>
							<div className={cssClasses}>
								<span className="username">{message.userName}: </span>
								<span className="body">{message.message}</span>
							</div>
						</div>
					)
				} )}

			</div>
		)
	}

	submitChatMessage = ( event ) => {
		const { onMessageSend, userName, partyId } = this.props

		event.preventDefault ()
		const inputValue = this.messageInput.value.trim ()
		onMessageSend ( inputValue, userName, partyId )
		this.messageInput.value = ''
	}

	render () {
		const { messagesInParty } = this.props

		return (
			<div className="chat-box">

				<div className="message-box" ref={e => this.messageBox = e}>
					{this.renderMessages ( messagesInParty )}
				</div>

				<form className="input-box" action="#" onSubmit={this.submitChatMessage}>
					<input
						type="text"
						ref={e => this.messageInput = e}
						className="input"
						placeholder="Say hello!"/>

					<input
						className="submit"
						type="submit"/>
				</form>

			</div>
		)
	}
}