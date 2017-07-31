// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './BrowsePage.css'

class BrowsePage extends Component {

	constructor ( props ) {
		super ( props )
		this.state = {
		}
	}

	componentDidMount () {
		// @todo: check if username exists in localstorage, if not -> return to the home page
		if(1===1){
			this.props.router.push('/')
		}
	}

	render () {

		return (
			<div className="browse-page">
				<div className="g-row">
					<div className="g-col">

					yoo

					</div>
				</div>
			</div>
		)
	}
}


//=====================================
//  CONNECT
//-------------------------------------

const mapDispatchToProps = {

}

BrowsePage = connect (
	null,
	mapDispatchToProps
) ( BrowsePage )

export default BrowsePage