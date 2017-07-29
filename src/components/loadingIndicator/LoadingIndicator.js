import React, { Component } from 'react'
import './LoadingIndicator.css'
import PropTypes from 'prop-types'

export default class LoadingIndicator extends Component {
	static propTypes = {
		loading: PropTypes.bool
	}

	render() {
		if (this.props.loading) {
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