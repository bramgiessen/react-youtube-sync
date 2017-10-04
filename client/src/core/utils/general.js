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