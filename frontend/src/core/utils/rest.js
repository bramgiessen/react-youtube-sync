//=====================================
//  rest.js : Containing utils related to network/api calls
//-------------------------------------

export const restUtils = {
	handleRestResponse: ( response ) => {
		if ( response.status >= 200 && response.status < 300 ) {
			return Promise.resolve ( response.json () )
		} else {
			return Promise.resolve ( response.json () )
				.then ( message => {
					const error = new Error ( `${message.message} (code ${message.statusCode})` )
					error.status = response.status
					error.statusCode = message.statusCode

					throw error
				} )
		}
	}
}