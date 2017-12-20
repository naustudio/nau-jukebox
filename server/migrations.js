/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { Migrations } from 'meteor/percolate:migrations';
import { Users } from '../imports/collections';

Migrations.add({
	version: 1,
	up() {
		// Migrate old user type to new one, moving the userName only
		Users.find({ profile: { $exists: false } }).forEach(u => {
			Users.update(u._id, { $set: { profile: { name: u.userName } } });
		});
	},
});
