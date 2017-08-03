//=====================================
//  video.js : Containing utils related to video objects
//-------------------------------------

export const videoUtils = {

	/**
	 * Return the video details in a specified format, based on the video source
	 * @param video
	 * @param videoSource
	 * @returns {{id, thumbnailSrc, title, description}}
	 */
	getVideoDetails: ( video, videoSource ) => {
		switch ( videoSource ) {

			case 'youtube':
				return getYoutubeVideoDetails ( video )

			default:
				break
		}
	}
}

/**
 * Return Youtube video details in our defined video details format
 * @param video
 * @returns
 * {{id: string,
 * thumbnailSrc: (string),
 * title: (string),
 * description: (string)}}
 */
const getYoutubeVideoDetails = ( video ) => {
	const snippet = video.snippet

	return {
		id: video.id.videoId,
		thumbnailSrc: snippet.thumbnails.medium.url,
		title: snippet.title,
		description: snippet.description
	}
}