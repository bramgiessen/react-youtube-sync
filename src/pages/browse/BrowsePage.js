// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './BrowsePage.css'

// Constants
import { introductionText } from '../../core/constants'

// Actions
import { appActions } from '../../core/app/index'
import { videoListActions } from '../../core/videoList/index'

// Components
import PageHeader from '../../components/pageHeader/PageHeader'
import VideoList from '../../components/videoList/VideoList'

class BrowsePage extends Component {

	constructor ( props ) {
		super ( props )
		this.state = {}
	}

	componentDidMount () {
		// Read userName from localStorage, if it doesn't exist -> redirect to the home page
		// so the user can set a username from here
		const userName = this.props.user.userName
		if ( !userName ) {
			this.props.navigateToPath ( '/' )
		}

		// Load an initial set of movies from Youtube into Redux store
		this.props.loadYoutubeVideos ( 'documentary', 'movie' )
	}

	render () {
		const { user, isFetchingVideos, youtubeVideos, handleVideoSelection } = this.props

		return (
			<div className="browse-page">
				<PageHeader
					titleLeader='Hi'
					titleMain={user.userName}
					titleAfter={', It\'s partytime!'}
					descriptionText={introductionText}
				/>

				<div className="g-row">

					<VideoList
						showLoadingAnimation={isFetchingVideos}
						youtubeVideos={youtubeVideos}
						handleVideoSelection={handleVideoSelection}
					/>

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
		isFetchingVideos: state.videoList.isFetching,
		youtubeVideos: state.videoList.youtubeVideos,
		user: state.user,
	}
}

const mapDispatchToProps = {
	navigateToPath: appActions.navigateToPath,
	loadYoutubeVideos: videoListActions.loadYoutubeVideos,
	handleVideoSelection: videoListActions.handleVideoSelection
}

BrowsePage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( BrowsePage )

export default BrowsePage