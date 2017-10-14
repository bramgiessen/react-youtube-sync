// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './PageHeader.css'

export default class PageHeader extends Component {
	static propTypes = {
		titleLeader: PropTypes.string.isRequired,
		titleMain: PropTypes.string,
		titleAfter: PropTypes.string,
	}

	render () {
		const { titleLeader, titleMain, titleAfter } = this.props

		return (
			<div className="page-header">
				<div className="g-row">

					<div className="page-header-title">
						<span className="leader">{titleLeader}</span>
						<span className="title-main">{titleMain}</span>
						{ titleAfter ? <span className="title-after">{titleAfter}</span> : null }
					</div>

				</div>
			</div>
		)
	}
}