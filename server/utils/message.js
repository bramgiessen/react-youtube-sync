// Libs & utils
import { generalUtils } from "./index"

export const messageUtils = {

	/**
	 * Generate a message to let other users know that a new user joined the party
	 * @param userName
	 * @param partyId
	 * @returns {{message: string, userName: string, partyId: *}}
	 */
	generateUserJoinedMessage: ( userName, partyId, serverUserName ) => {
		return { message: `${userName} joined the party`, userName: serverUserName, partyId }
	},

	/**
	 * Generate a message to let other users know that a user skipped / paused / plays a video
	 * @param socketId
	 * @param playerState
	 * @param timeInVideo
	 * @returns {string}
	 */
	generatePlayerStateChangeMessage: ( userName, videoPlayerState ) => {
		const formattedTimeInVideo = generalUtils.toHHMMSS ( videoPlayerState.timeInVideo )
		let playerStateChangeMessage = ''

		switch ( videoPlayerState.playerState ) {
			case 'paused':
				playerStateChangeMessage = `${userName} paused the video at ${formattedTimeInVideo}`
				break;
			case 'playing':
				playerStateChangeMessage = `${userName} started playing the video at ${formattedTimeInVideo}`
				break;
		}
		return playerStateChangeMessage
	},
}