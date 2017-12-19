/* © 2017 NauStud.io
 * @author Thanh Tran, Tung Tran, Tw
 */
/*global Songs:true, AppStates:true, Users:true, SC, moment*/
import { JukeboxPlayer } from '../imports/player/JukeboxPlayer.js';
import { SongOrigin } from '../imports/constants.js';

import React from 'react';
import ReactDOM from 'react-dom';
import App from '../imports/App';
import { render } from 'react-dom';

Meteor.startup(() => {
	render(<App />, document.getElementById('root'));
});

