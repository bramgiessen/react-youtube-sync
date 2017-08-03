// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './SearchPage.css'

// Actions
import { videoListActions } from '../../core/videoList/index'

// Components
import PageHeader from '../../components/pageHeader/PageHeader'
import VideoList from '../../components/videoList/VideoList'

class SearchPage extends Component {

	constructor ( props ) {
		super ( props )
		this.state = {}
	}

	componentDidMount () {
		// Read userName from localStorage, if it doesn't exist -> redirect to the home page
		// so the user can set a username from here first
		const userName = this.props.user.userName
		if ( !userName ) {
			this.props.router.push ( '/' )
		}

		// Load Youtube video search results into Redux store
		this.props.loadYoutubeVideos ( this.props.params.query )
	}

	componentWillUpdate(nextProps) {
		if (nextProps.params.query  !== this.props.params.query ) {
			// Search query has been changed
			this.props.loadYoutubeVideos ( nextProps.params.query )
		}
	}

	render () {
		const currentQuery = this.props.params.query

		return (
			<div className="browse-page">
				<PageHeader
					titleLeader='Search results'
					titleMain={currentQuery}
				/>

				<div className="g-row">

					<VideoList
						showLoadingAnimation={this.props.isFetchingVideos}
						youtubeVideos={this.props.youtubeVideos}
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
		user: state.user
	}
}

const mapDispatchToProps = {
	loadYoutubeVideos: videoListActions.loadYoutubeVideos
}

SearchPage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( SearchPage )

export default SearchPage