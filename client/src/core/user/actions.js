export const userActions = {
	SET_USER_NAME: 'SET_USER_NAME',


	setUserName: userName => ({
		type: userActions.SET_USER_NAME,
		payload: userName
	}),
}