import React, { Component } from 'react';
import AppHeader from '../imports/components/AppHeader';
import AppBody from '../imports/components/AppBody';

class App extends Component {

	render() {
		return (
			<div>
				<AppHeader />
				<AppBody />
			</div>
		);
	}
}

export default App;
