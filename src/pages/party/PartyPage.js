// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './PartyPage.css'

// Components
import PageHeader from '../../components/pageHeader/PageHeader'

class PartyPage extends Component {

	constructor ( props ) {
		super ( props )
		this.state = {
		}
	}

	render () {

		return (
			<div className="party-page">
				<PageHeader
					titleLeader='Welcome to party'
					titleMain={'partyname goes here'}
				/>

				<div className="g-row">
					<div className="g-col">


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