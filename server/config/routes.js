// Libs & utils
import express from 'express'
import { pathConfig } from './'

//=====================================
//  ROUTE CONFIGURATION
//-------------------------------------
export const routeConfig = {
	configureRoutes: app => {
		const router = new express.Router ()
		const htmlFile = pathConfig.indexHtml

		router.all ( '*', ( req, res ) => {
			res.sendFile ( htmlFile )
		} )

		app.use ( router )
	}
}