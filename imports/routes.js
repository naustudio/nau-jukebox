/* © 2017 NauStud.io
 * @author Eric Tran
 */

import React from 'react';
import { Router, Route, Redirect, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import ReactGA from 'react-ga';
import withTracker from './withTracker';

// route components
import App from './App';
import Dashboard from './Dashboard';

const browserHistory = createBrowserHistory();
ReactGA.initialize('UA-88296410-2');

const renderRoutes = () => (
	<Router history={browserHistory}>
		<Switch>
			<Route exact path="/" component={withTracker(Dashboard)} />
			<Route path="/room/:slug" component={withTracker(App)} />
			<Redirect to="/" />
		</Switch>
	</Router>
);

export default renderRoutes;
