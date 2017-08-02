// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'

// CSS
import './BrowsePage.css'

// Actions
import { videoListActions } from "../../core/videoList/index"

// Components
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
			this.props.router.push ( '/' )
		}

		// Load the initial set of movies from Youtube into Redux store
		this.props.loadInitialYoutubeMovies()
	}

	render () {

		console.log(this.props)
		return (
			<div className="browse-page">
				<div className="g-row">
					<div className="g-col">

						<VideoList youtubeVideos={this.props.youtubeVideos}/>

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
		youtubeVideos : state.videoList.youtubeVideos,
		user : state.user,
	}
}

const mapDispatchToProps = {
	loadInitialYoutubeMovies : videoListActions.loadInitialYoutubeMovies
}

BrowsePage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( BrowsePage )

export default BrowsePage