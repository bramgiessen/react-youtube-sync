// Libs & utils
import React from 'react'

//=====================================
//  BACKEND / WEBSOCKET SERVER
//-------------------------------------
export const WEBSOCKET_URL = 'http://localhost:9000'


//=====================================
//  YOUTUBE API
//-------------------------------------
export const YOUTUBE_API_KEY = 'AIzaSyDTLiPIRIn1PGKsUxJXtn7PEqb-nYTlOOo'

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'
export const YOUTUBE_SEARCH_URL = `${YOUTUBE_API_BASE_URL}/search`


//=====================================
//  VARIOUS
//-------------------------------------
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
