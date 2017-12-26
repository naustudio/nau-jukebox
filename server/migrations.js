/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { Migrations } from 'meteor/percolate:migrations';
import { Users, Rooms, Songs } from '../imports/collections';

Migrations.add({
	version: 1,
	up() {
		// Migrate old user type to new one, moving the userName only
		Users.find({ profile: { $exists: false } }).forEach(u => {
			Users.update(u._id, { $set: { profile: { name: u.userName } } });
		});
	},
});

Migrations.add({
	version: 2,
	up() {
		const countRoom = Rooms.find({}).count();
		const hostUser = Users.findOne({ 'profile.name': 'Ha Vo' });
		if (countRoom === 0 && hostUser) {
			Rooms.insert(
				{
					name: 'Nâu',
					slug: 'nau',
					createdBy: hostUser._id,
					hostId: hostUser._id,
					password: '',
				},
				(err, id) => {
					if (err) {
						console.log(err);
					}

					if (id) {
						Songs.update({}, { $set: { roomId: id } }, { multi: true });
						Users.update({}, { $set: { roomId: id }, $unset: { isHost: '', isOnline: '' } }, { multi: true });
					}
				}
			);
		}
	},
});
