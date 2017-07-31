import App from './components/app/App'
import HomePage from './pages/home/HomePage'
import BrowsePage from './pages/browse/BrowsePage'


export const routes = {
	path: '/',
	component: App,
	childRoutes: [
		{
			indexRoute: {
				component: HomePage
			}
		},
		{
			path: '/browse',
			component: BrowsePage
		},
		// {
		// 	path: '/users/:id/:resource',
		// 	component: UserPage
		// }
	]
};