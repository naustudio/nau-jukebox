
ServiceConfiguration.configurations.upsert({
	service: 'facebook'
}, {
	$set: {
		appId: '1944697045808357', //Meteor.settings.facebook.appId,
		loginStyle: 'popup',
		secret: '5d01be11dcc52563b75ed18f2201fbe2', //Meteor.settings.facebook.secret
	}
});

ServiceConfiguration.configurations.upsert({
	service: 'google'
}, {
	$set: {
		clientId: '349578608446-pb173i52g2gavcb50r1pv0trm2poastc.apps.googleusercontent.com', //Meteor.settings.google.clientId,
		secret: 'wJQUTj6TohUYLiS_PUy_-LHe', //Meteor.settings.google.secret
	}
});
