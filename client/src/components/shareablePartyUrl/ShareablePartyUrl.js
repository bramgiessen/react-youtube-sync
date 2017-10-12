// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './ShareablePartyUrl.css'

export default class ShareablePartyUrl extends Component {
	static propTypes = {
		partyUrl: PropTypes.string.isRequired,
	}

	handleFocus = ( event ) => {
		// we use setSelectionRange() because select() doesn't work on IOS
		event.target.setSelectionRange ( 0, 9999 )
	}

	render () {
		const { partyUrl } = this.props

		return (
			<div className="share-party-url">
				<h2 className="title">Your shareable party URL:</h2>
				<input type="text"
					   readOnly='readonly'
					   value={partyUrl}
					   onClick={this.handleFocus}
				/>
			</div>
		)
	}
}