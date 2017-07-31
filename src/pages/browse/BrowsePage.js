// Libs & utils
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadProperty } from "../../utils/persist"

// CSS
import './BrowsePage.css'

// Components
import VideoList from '../../components/videoList/VideoList'

// Actions
import { appActions } from "../../components/app/redux/appActions"

class BrowsePage extends Component {

	constructor ( props ) {
		super ( props )
		this.state = {}
	}

	componentDidMount () {
		// Read userName from localStorage, if it doesn't exist -> redirect to the home page
		// so the user can set a username from here
		const userName = loadProperty ( 'userName', null )
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

						<VideoList />

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
		youtubeVideos : state.app.youtubeVideos
	}
}

const mapDispatchToProps = {
	loadInitialYoutubeMovies : appActions.loadInitialYoutubeMovies
}

BrowsePage = connect (
	mapStateToProps,
	mapDispatchToProps
) ( BrowsePage )

export default BrowsePage