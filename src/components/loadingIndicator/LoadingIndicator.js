// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './LoadingIndicator.css'

export default class LoadingIndicator extends Component {
	static propTypes = {
		showLoadingAnnimation: PropTypes.bool
	}

	render() {
		if (this.props.showLoadingAnnimation) {
			return (
				<div className="loading-indicator">
					<div className="circle circle-1"></div>
					<div className="circle circle-2"></div>
					<div className="circle circle-3"></div>
				</div>
			)
		} else {
			return null
		}
	}
}