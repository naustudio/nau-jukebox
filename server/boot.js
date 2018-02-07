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
			clientId: '5a7a851ba09c92497ac0',
			secret: 'c62462c1-b02f-4052-9b9a-3d5035a7f7e5',
			loginStyle: 'popup',
			apiHost: 'https://api.goalify.plus',
		},
	}
);
