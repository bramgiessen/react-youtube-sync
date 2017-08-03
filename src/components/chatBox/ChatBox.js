// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './ChatBox.css'

export default class ChatBox extends Component {
	static propTypes = {}

	componentDidMount() {
		this.messageBox.scrollTop = this.messageBox.scrollHeight
	}

	componentDidUpdate(){
		this.messageBox.scrollTop = this.messageBox.scrollHeight
	}

	renderMessages = ( messages ) => {
		return (
			<div className="messages-wrapper">

				<div className="message-wrapper">
					<div className="message">
						<span className="username">{'Gijs'}: </span>
						<span className="body">Yooooo</span>
					</div>
				</div>

				<div className="message-wrapper">
					<div className="message self">
						<span className="username">{'Bram'}: </span>
						<span className="body">Eyyy</span>
					</div>
				</div>

				<div className="message-wrapper">
					<div className="message">
						<span className="username">{'Gijs'}: </span>
						<span className="body">Alles goed?</span>
					</div>
				</div>

				<div className="message-wrapper">
					<div className="message">
						<span className="username">{'Gijs'}: </span>
						<span className="body">Alles goed?</span>
					</div>
				</div>

				<div className="message-wrapper">
					<div className="message">
						<span className="username">{'Gijs'}: </span>
						<span className="body">Alles goed?</span>
					</div>
				</div>

				<div className="message-wrapper">
					<div className="message">
						<span className="username">{'Gijs'}: </span>
						<span className="body">Alles goed?</span>
					</div>
				</div>

				<div className="message-wrapper">
					<div className="message">
						<span className="username">{'Gijs'}: </span>
						<span className="body">Alles goed?</span>
					</div>
				</div>
			</div>
		)
	}

	render () {
		return (
			<div className="chat-box" >

				<div className="message-box" ref={e => this.messageBox = e}>
					{this.renderMessages ()}
				</div>

				<form className="input-box" action="#" onSubmit={() => {
					console.log ( 'errr' )
				}}>
					<input
						type="text"
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