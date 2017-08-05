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
	}

}