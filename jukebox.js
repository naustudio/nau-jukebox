// Set up a collection to contain song information. On the server,
// it is backed by a MongoDB collection named 'songs'.

/*global Songs:true*/

Songs = new Meteor.Collection('songs');

if (Meteor.isClient) {
	Template.songlist.songs = function() {
		return Songs.find({}, {sort: {name: 1}});
	};

	// Template.songlist.selected_name = function() {
	// 	var player = Songs.findOne(Session.get('selected_player'));
	// 	return player && player.name;
	// };

	// Template.player.selected = function() {
	// 	return Session.equals('selected_player', this._id) ? 'selected' : '';
	// };

	Template.songlist.events({
		'submit #add-song-form': function(event) {
			event.preventDefault();
			var submitData = $(event.currentTarget).serializeArray();
			var songurl;

			for (var i = 0; i < submitData.length; i++) {
				if (submitData[i].name === 'songurl') {
					songurl = submitData[i].value;
				}
			}

			alert('Song list add ' + songurl);
			Songs.insert({name: songurl});
		}
	});

	// Template.player.events({
	// 	'click': function() {
	// 		Session.set('selected_player', this._id);
	// 	}
	// });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function() {
		if (Songs.find().count() === 0) {
			var names = [
				'Ada Lovelace',
				'Grace Hopper',
				'Marie Curie',
				'Carl Friedrich Gauss',
				'Nikola Tesla',
				'Claude Shannon'
			];
			for (var i = 0; i < names.length; i++) {
				Songs.insert({name: names[i]});
			}
		}
	});
}
