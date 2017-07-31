// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './PartyPage.css'

class PartyPage extends Component {

	constructor ( props ) {
		super ( props )
		this.state = {
		}
	}

	render () {

		return (
			<div className="party-page">
				<div className="g-row">
					<div className="g-col">

					partyyy

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

PartyPage = connect (
	null,
	mapDispatchToProps
) ( PartyPage )

export default PartyPage