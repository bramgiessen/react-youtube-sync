// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './PageHeader.css'

export default class PageHeader extends Component {
	static propTypes = {
		titleLeader: PropTypes.string.isRequired,
		titleMain: PropTypes.string.isRequired,
		titleAfter: PropTypes.string,
		descriptionText: PropTypes.object,
	}

	/**
	 * Conditionally render a page description section
	 * @param content
	 * @returns {*}
	 */
	renderPageHeaderDescription = ( content ) => {
		return content ? <div className="page-header-description">{content}</div> : null
	}

	/**
	 * Conditionally render a title-after section (title rendered after the main title)
	 * @param content
	 * @returns {*}
	 */
	renderTitleAfter = ( content ) => {
		return content ? <span className="title-after">{content}</span> : null
	}

	render () {
		const { descriptionText, titleLeader, titleMain, titleAfter } = this.props

		return (
			<div className="page-header">
				<div className="g-row">

					<div className="page-header-title">
						<span className="leader">{titleLeader}</span>
						<span className="title-main">
							{titleMain}
						</span>
						{this.renderTitleAfter ( titleAfter )}
					</div>

					{this.renderPageHeaderDescription ( descriptionText )}

				</div>
			</div>
		)
	}
}