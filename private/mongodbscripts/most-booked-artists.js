/* eslint-disable */
db.getCollection('songs').aggregate([
	{
		$match: {
			timeAdded: {
				$lt: new Date('2017-12-31T23:59:59Z').getTime(),
				$gt: new Date('2017-01-01T00:00:00Z').getTime(),
			},
		},
	},
	{
		$group: {
			_id: '$artist',
			count: { $sum: 1 },
			from: { $push: '$name' },
		},
	},
	{
		$sort: {
			count: -1,
		},
	},
	{ $out: 'statsartist2017' },
]);
