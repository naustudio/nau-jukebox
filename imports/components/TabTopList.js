/* © 2017
 * @author Tu Nguyen
 */

import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { startOfWeek, endOfWeek } from 'date-fns';

class TabTopList extends Component {
	render() {
		// console.log('Start of week ', startOfWeek(new Date(2017, 12, 20, 11, 55, 0)));
		// console.log('End of week ', endOfWeek(new Date(2017, 12, 20, 11, 55, 0)));

		return (
			<section className="tab__body song">
				<div className="container song__container">
					<h1>Top list</h1>
				</div>
			</section>
		);
	}
}

// export default withTracker(() => {

// })(TabTopList);

export default TabTopList;
