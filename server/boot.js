/* © 2017 NauStud.io
 * @author Thanh Tran
 */
import { ServiceConfiguration } from 'meteor/service-configuration';

ServiceConfiguration.configurations.upsert(
	{
		service: 'facebook',
	},
	{
		$set: {
			appId: '1944697045808357', //Meteor.settings.facebook.appId,
			loginStyle: 'popup',
			secret: '5d01be11dcc52563b75ed18f2201fbe2', //Meteor.settings.facebook.secret
		},
	}
);

ServiceConfiguration.configurations.upsert(
	{
		service: 'google',
	},
	{
		$set: {
			clientId: '349578608446-pb173i52g2gavcb50r1pv0trm2poastc.apps.googleusercontent.com', //Meteor.settings.google.clientId,
			secret: 'wJQUTj6TohUYLiS_PUy_-LHe', //Meteor.settings.google.secret
		},
	}
);

ServiceConfiguration.configurations.upsert(
	{
		service: 'goalify',
	},
	{
		$set: {
			clientId: '5a74395e2bde1064ad58', //Meteor.settings.goalify.clientId,
			secret: '4fc7d2f6-d8c5-4df8-ab9a-78ee0a63a94b', //Meteor.settings.goalify.secret
			loginStyle: 'popup',
			apiHost: 'https://api.goalify.plus',
		},
	}
);
