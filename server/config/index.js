import pkg from './paths.cjs';
const { pathConfig } = pkg;
// Nice to keep all exports in one place
// so we can import them all from the same file in other places
export { appConfig } from './app.js'
export { routeConfig } from './routes.js'
export { pathConfig }