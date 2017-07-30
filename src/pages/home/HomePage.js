// Libs & utils
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// CSS
import './HomePage.css'

// Components
import AppDescription from '../../components/appDescription/AppDescription'
import CreatePartyForm from '../../components/createPartyForm/CreatePartyForm'

export default class HomePage extends Component {
	static propTypes = {}

	constructor ( props ) {
		super ( props )
		this.state = {
			creatingParty: false
		}
	}

	/**
	 * When the user presses the 'Start a Youtube Party' button
	 */
	startPartyButtonClickHandler = () => {
		this.setState ( { creatingParty: true } )
	}

	/**
	 * When the user cancels the creation of a party
	 */
	cancelPartyButtonClickHandler = () => {
		this.setState ( { creatingParty: false } )
	}

	render () {
		const creatingParty = this.state.creatingParty

		return (
			<div className="home-page">
				<div className="g-row">
					<div className="g-col">

						<AppDescription
							creatingParty={creatingParty}
							startPartyButtonClickHandler={this.startPartyButtonClickHandler}
						/>

						<CreatePartyForm
							creatingParty={creatingParty}
							cancelPartyButtonClickHandler={this.cancelPartyButtonClickHandler}
						/>

					</div>
				</div>
			</div>
		)
	}
}