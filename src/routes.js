import App from './components/app/App';
import HomePage from './pages/home/HomePage';


export const routes = {
	path: '/',
	component: App,
	childRoutes: [
		{
			indexRoute: {
				component: HomePage
			}
		},
		// {
		// 	path: '/search',
		// 	component: SearchPage
		// },
		// {
		// 	path: '/users/:id/:resource',
		// 	component: UserPage
		// }
	]
};