/* © 2017 NauStud.io
 * @author Thanh Tran, Eric Tran, Tw
 */
import React from 'react';
import { render } from 'react-dom';

import App from '../imports/App';
// import { JukeboxPlayer } from '../imports/player/JukeboxPlayer.js';
// import { SongOrigin } from '../imports/constants.js';

Meteor.subscribe('userData'); // needed to get other fields of current user
Meteor.subscribe('Meteor.users.public'); // needed to get public fields of Users
Meteor.startup(() => {
	render(<App />, document.getElementById('root'));
});
