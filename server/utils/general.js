export const generalUtils = {

	/**
	 * Merge all properties from all objects in an array
	 * @param objArray
	 */
	mergeObjectsInArray: ( objArray ) => {
		return objArray.reduce ( function ( result, currentObject ) {
			for ( const key in currentObject ) {
				if ( currentObject.hasOwnProperty ( key ) ) {
					result[ key ] = currentObject[ key ]
				}
			}
			return result
		}, {} )
	},

	/**
	 * Generate a random string
	 * @returns {string}
	 */
	generateId: ( length = 5 ) => {
		let text = ""
		const possibleChars = "abcdefghijklmnopqrstuvwxyz0123456789"

		for ( let i = 0; i < length; i++ )
			text += possibleChars.charAt ( Math.floor ( Math.random () * possibleChars.length ) )

		return text
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
	 * Round a number to given amount of decimal places
	 * (Written by m93a, found on Stack Overflow)
	 * @param number
	 * @param decimals
	 * @returns {number}
	 */
	toFixedNumber: ( number, decimals ) => {
		const pow = Math.pow ( 10, decimals )
		return +( Math.round ( number * pow ) / pow )
	}

}