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
	}
}