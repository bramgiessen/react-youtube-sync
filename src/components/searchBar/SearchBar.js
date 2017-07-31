// Libs & utils
import React, { Component } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

// CSS
import './SearchBar.css'

export default class SearchBar extends Component {
	static propTypes = {
		searchBar: PropTypes.object.isRequired,
		handleSearch: PropTypes.func.isRequired,
	}

	componentDidMount () {
		this.searchBar.addEventListener ( 'transitionend', () => {
			if ( this.props.searchBar.expanded ) this.input.focus ()
		}, false )
	}

	componentWillUpdate ( nextProps ) {
		if ( nextProps.searchBar.expanded ) this.input.value = ''
	}

	handleSubmit = ( event ) => {
		event.preventDefault ()

		const inputValue = this.input.value.trim ()
		console.log ( inputValue )
		this.props.handleSearch ( inputValue )
	}

	render () {
		const cssClasses = classNames ( 'search-bar', {
			'open': this.props.searchBar.expanded
		} )

		return (
			<div className={cssClasses} ref={e => this.searchBar = e}>

				<form className="search-form" onSubmit={this.handleSubmit} noValidate>
					<input
						ref={e => this.input = e}
						autoComplete="off"
						className="input"
						maxLength="60"
						placeholder="Search Videos / Movies"
						tabIndex="0"
						type="text"
					/>
				</form>

			</div>
		)
	}
}