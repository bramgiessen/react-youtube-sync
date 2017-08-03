// Libs & utils
import { generalUtils } from '../utils/index'

export const appActions = {
	NAVIGATE_TO_PATH: 'NAVIGATE_TO_PATH',


	/**
	 * Navigate to a defined path (see routes.js for defined routes)
	 * @param path
	 */
	navigateToPath: path => ({
		type: appActions.NAVIGATE_TO_PATH,
		payload: `${path}?index=${generalUtils.generateRandomId(15)}`
	}),
}