export const generalUtils = {
	/**
	 * Merge all properties from all objects in an array
	 * @param objArray
	 */
	mergeObjectsInArray: ( objArray ) => {
		return objArray.reduce ( function ( result, currentObject ) {
			for ( var key in currentObject ) {
				if ( currentObject.hasOwnProperty ( key ) ) {
					result[ key ] = currentObject[ key ];
				}
			}
			return result;
		}, {} );
	},

	/**
	 * Generate a random string
	 * @returns {string}
	 */
	generateId: () => {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for ( var i = 0; i < 5; i++ )
			text += possible.charAt ( Math.floor ( Math.random () * possible.length ) );

		return text;
	},

    /**
	 * Convert amount of seconds to string in format of HH:MM:SS
     * @param seconds
     * @returns {string}
     */
    toHHMMSS: (seconds) => {
        var sec_num = parseInt(seconds, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+':'+minutes+':'+seconds;
    },

    /**
	 * Round a number to given amount of decimal places
	 * (Written by m93a, found on Stack Overflow)
     * @param x
     * @param base
     * @returns {number}
     */
    toFixedNumber: (number, decimals) => {
    const pow = Math.pow(10, decimals)
    return +( Math.round(number*pow) / pow )
	}

}