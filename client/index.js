/* © 2017 NauStud.io
 * @author Thanh Tran, Eric Tran, Tw
 */


import React from 'react';
import { render } from 'react-dom';

import App from '../imports/App';
// import { JukeboxPlayer } from '../imports/player/JukeboxPlayer.js';
// import { SongOrigin } from '../imports/constants.js';

Meteor.startup(() => {
	render(<App />, document.getElementById('root'));
});

