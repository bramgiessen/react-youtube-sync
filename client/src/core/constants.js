// Libs & utils
import React from 'react'

//=====================================
//  BACKEND / WEBSOCKET SERVER
//-------------------------------------
export const WEBSOCKET_URL = 'http://192.168.1.19:9000'

//=====================================
//  YOUTUBE API
//-------------------------------------
export const YOUTUBE_API_KEY = 'AIzaSyDTLiPIRIn1PGKsUxJXtn7PEqb-nYTlOOo'

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'
export const YOUTUBE_SEARCH_URL = `${YOUTUBE_API_BASE_URL}/search`

//=====================================
//  VIDEO PLAYER
//-------------------------------------
export const videoPlayerConfig = {
	youtube: {
		playerVars: { showinfo: 1 }
	}
}

//=====================================
//  VARIOUS
//-------------------------------------

// Initial query for videos to display on the browse page
export const initialVideoQuery = {
	query: 'beautiful Copenhagen',
	videoType: 'any'
}

export const introductionText = (
	<div>
		<p> All of the movies that you find on this page are completely <i>free</i> movies that are uploaded to Youtube,
			but
			in the top part of this page you can search for any Youtube video you like!
		</p>
		<p> Just select any movie or video you like to watch <i>together with friends</i> to create a party,
			share the
			automatically generated <i>party url</i> with all your friends and start watching together!
			All in
			perfect sync: when you pause, rewind or skip the movie, this will also happen for everyone else in your
			party and vice-versa.
			It's that easy!
		</p>
	</div>
)
