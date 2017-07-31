import App from './components/app/App'
import HomePage from './pages/home/HomePage'
import BrowsePage from './pages/browse/BrowsePage'
import PartyPage from './pages/party/PartyPage'


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
		{
			path: '/party/:id',
			component: PartyPage
		}
	]
};