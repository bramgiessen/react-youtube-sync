//=====================================
//  appActions.js : Containing global app-wide actions
//-------------------------------------

export const appActions = {
	SET_USER_NAME: 'SET_USER_NAME',
	CREATE_PARTY: 'CREATE_PARTY',


	setUserName: userName => ({
		type: appActions.SET_USER_NAME,
		payload: userName
	}),

	/**
	 * Action creator, sets the given username in store
	 * and handles creation of a new party
	 * @param userName
	 * @returns {function(*=, *)}
	 */
	createParty: (userName) => {
		return (dispatch) => {
			// Set the given username in store
			// todo: persist username in localstore so when there is a username the user can refresh the browse button without being resirected home
			dispatch(appActions.setUserName(userName))

			// todo: write logic that creates party id in backend
		}
	}
}