//=====================================
//  persist.js : Containing utils related to data persistence (i.e. in localStorage)
//-------------------------------------

export const persistUtils = {
	/**
	 * Helper function to load and deserialize a key/value in the browsers local storage.
	 * The function will return undefined when deserializing a stored key failed
	 * @param {string} key
	 * @param {*} [defaultValue=undefined] Optional default value to be returned
	 *                                     When key was not found in local storage
	 * @return {*} value
	 */
	loadProperty: ( key, defaultValue = undefined ) => {
		try {
			const value = localStorage[ key ]

			return value !== undefined
				? JSON.parse ( value )
				: defaultValue
		}
		catch ( err ) {
			console.error ( err )
			return defaultValue
		}
	},

	/**
	 * Helper function to serialize and store a key/value in the browsers local storage
	 * @param {string} key
	 * @param {*} value
	 */
	saveProperty: ( key, value ) => {
		try {
			localStorage[ key ] = JSON.stringify ( value )
		}
		catch ( err ) {
			console.error ( err )
		}
	}
}
