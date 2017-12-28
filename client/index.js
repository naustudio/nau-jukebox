/* © 2017 NauStud.io
 * @author Thanh Tran, Eric Tran, Tw
 */
import { render } from 'react-dom';

import renderRoutes from '../imports/routes';

Meteor.subscribe('userData'); // needed to get other fields of current user
Meteor.subscribe('Meteor.users.public'); // needed to get public fields of Users
Meteor.startup(() => {
	render(renderRoutes(), document.getElementById('root'));
});
