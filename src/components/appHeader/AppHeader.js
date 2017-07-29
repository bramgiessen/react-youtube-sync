import React, { Component } from 'react'
import './AppHeader.css'
import PropTypes from 'prop-types'

export default class AppHeader extends Component {

	static propTypes = {
		loading: PropTypes.bool
	}

	render () {
		return (
			<div className="app-header">

				<div className="g-row">

					<div className="g-col">

						<div className="header-title-wrapper">
							<span>Youtube Video Party • React & Redux</span>
						</div>

						<ul className="header-actions">
							<li>
								<span className="btn btn-icon fa fa-search"/>
							</li>
							<li>
								<a href="http://bramgiessen.com" target="_blank" rel="noopener noreferrer">
									<span className="btn btn-icon fa fa-globe"/>
								</a>
							</li>
							<li>
								<a href="https://github.com/brambo48/react-youtube-sync" target="_blank" rel="noopener noreferrer">
									<span className="btn btn-icon fa fa-github"/>
								</a>
							</li>
						</ul>

					</div>

				</div>

			</div>
		)
	}
}