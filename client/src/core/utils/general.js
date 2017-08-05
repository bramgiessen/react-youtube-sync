//=====================================
//  general.js : Containing general, app-wide utils
//-------------------------------------

export const generalUtils = {

	/**
	 * Generate a random string
	 * @returns {string}
	 */
	generateRandomId: (length = 15) => {
		return Math.random ().toString ( 36 ).substring ( 0, length );
	},

	/**
	 * Extract the party id from the url
	 * @param url
	 * @returns {*}
	 */
	getPartyIdFromUrl: (url) => {
		return url.substr(url.lastIndexOf('/') + 1).split ( '?' )[ 0 ]
	}
}