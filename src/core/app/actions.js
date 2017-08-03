export const appActions = {
	NAVIGATE_TO_PATH: 'NAVIGATE_TO_PATH',


	navigateToPath: path => ({
		type: appActions.NAVIGATE_TO_PATH,
		payload: path
	}),
}