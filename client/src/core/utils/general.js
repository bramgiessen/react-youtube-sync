//=====================================
//  general.js : Containing general, app-wide utils
//-------------------------------------

export const generalUtils = {

	/**
	 * Generate a random string
	 * @returns {string}
	 */
	generateRandomId: ( length = 15 ) => {
		return Math.random ().toString ( 36 ).substring ( 0, length );
	},

	/**
	 * Round a number to given amount of decimal places
	 * (Written by m93a, found on Stack Overflow)
	 * @param number
	 * @param decimals
	 * @returns {number}
	 */
	toFixedNumber: ( number, decimals ) => {
		const pow = Math.pow ( 10, decimals )
		return +( Math.round ( number * pow ) / pow )
	},

	/**
	 * Convert amount of seconds to duration string in format of HH:MM:SS
	 * @param amountOfSeconds
	 * @returns {string}
	 */
	toHHMMSS: ( amountOfSeconds ) => {
		const sec_num = parseInt ( amountOfSeconds, 10 )
		let hours = Math.floor ( sec_num / 3600 )
		let minutes = Math.floor ( (sec_num - (hours * 3600)) / 60 )
		let seconds = sec_num - (hours * 3600) - (minutes * 60)

		if ( hours < 10 ) {
			hours = "0" + hours
		}
		if ( minutes < 10 ) {
			minutes = "0" + minutes
		}
		if ( seconds < 10 ) {
			seconds = "0" + seconds
		}

		return hours + ':' + minutes + ':' + seconds
	},

	/**
	 * Maximize an element on screen
	 * @param elem
	 */
	requestFullScreenOnElement: ( elem ) => {
		if ( elem.requestFullscreen ) {
			elem.requestFullscreen ();
		} else if ( elem.msRequestFullscreen ) {
			elem.msRequestFullscreen ();
		} else if ( elem.mozRequestFullScreen ) {
			elem.mozRequestFullScreen ();
		} else if ( elem.webkitRequestFullscreen ) {
			elem.webkitRequestFullscreen ();
		}
	},

	/**
	 * Minimize all maximized nodes on the page
	 */
	exitFullScreen: () => {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}