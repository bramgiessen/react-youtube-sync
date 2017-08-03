// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// CSS
import './PartyPage.css'

// Components
import PageHeader from '../../components/pageHeader/PageHeader'
import VideoPlayer from '../../components/videoPlayer/VideoPlayer'
import ChatBox from '../../components/chatBox/ChatBox'

class PartyPage extends Component {
	static propTypes = {
		selectedVideo: PropTypes.object.isRequired
	}

	constructor ( props ) {
		super ( props )
		this.state = {}
	}

	render () {
		const { selectedVideo } = this.props

		return (
			<div className="party-page">
				<PageHeader
					titleLeader='usernames in party go here'
					titleMain={'Weclome to the party!'}
				/>

				<div className="g-row">
					<div className="g-col">

						<div className="content-wrapper">
							<VideoPlayer
								selectedVideo={selectedVideo}
							/>

							<ChatBox />
						</div>
					</div>
				</div>
			</div>
		)
	}
}


//=====================================
//  CONNECT
//-------------------------------------

const mapStateToProps = ( state ) => {
	return {
		selectedVideo: state.videoList.selectedVideo
	}
}

const mapDispatchToProps = {}

PartyPage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( PartyPage )

export default PartyPage