// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Assets
import logo from '../../assets/logo_white.svg'

// CSS
import './AppHeader.css'

// Components
import SearchBar from '../searchBar/SearchBar'

export default class AppHeader extends Component {
	static propTypes = {
		searchBar: PropTypes.object.isRequired,
		toggleSearch: PropTypes.func.isRequired,
		handleSearch: PropTypes.func.isRequired,
	}

	render () {
		return (
			<div className="app-header">
				<div className="g-row">
					<div className="g-col">

						<div className="header-title-wrapper">
							<img src={logo} className="content logo" alt="bramgiessen.com logo"/>
							<span className="content">Youtube Video Party • React & Redux</span>
						</div>

						<ul className="header-actions">
							<li>
								<span className="btn btn-icon fa fa-search" onClick={this.props.toggleSearch}/>
							</li>
							<li>
								<a title="Visit my portfolio site" href="http://bramgiessen.com" target="_blank"
									 rel="noopener noreferrer">
									<span className="btn btn-icon fa fa-globe"/>
								</a>
							</li>
							<li>
								<a title="Open this project on Github" href="https://github.com/brambo48/react-youtube-sync"
									 target="_blank" rel="noopener noreferrer">
									<span className="btn btn-icon fa fa-github"/>
								</a>
							</li>
						</ul>

					</div>
				</div>

				<div className="g-row">
					<div className="g-col">
						<SearchBar
							searchBar={this.props.searchBar}
							handleSearch={this.props.handleSearch}
						/>
					</div>
				</div>

			</div>
		)
	}
}