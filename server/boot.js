/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Meteor } from 'meteor/meteor';

ServiceConfiguration.configurations.upsert(
	{
		service: 'facebook',
	},
	{
		$set: {
			appId: Meteor.settings.facebook.appId,
			loginStyle: 'popup',
			secret: Meteor.settings.facebook.secret,
		},
	}
);

ServiceConfiguration.configurations.upsert(
	{
		service: 'google',
	},
	{
		$set: {
			clientId: Meteor.settings.google.clientId,
			secret: Meteor.settings.google.secret,
		},
	}
);

ServiceConfiguration.configurations.upsert(
	{
		service: 'goalify',
	},
	{
		$set: {
			clientId: Meteor.settings.goalify.clientId,
			secret: Meteor.settings.goalify.secret,
			redirectUri: Meteor.settings.goalify.redirectUri,
			loginStyle: 'popup',
			apiHost: 'https://api.goalify.plus',
		},
	}
);
