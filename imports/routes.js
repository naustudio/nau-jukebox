/* © 2017 NauStud.io
 * @author Eric Tran
 */

import React from 'react';
import { Router, Route, Redirect, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';

// route components
import App from './App';
import Dashboard from './Dashboard';

const browserHistory = createBrowserHistory();

const renderRoutes = () => (
	<Router history={browserHistory}>
		<Switch>
			<Route exact path="/" component={Dashboard} />
			<Route path="/room/:slug" component={App} />
			<Redirect to="/" />
		</Switch>
	</Router>
);

export default renderRoutes;
