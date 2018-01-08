/**
 * This script will group songs booked by day
 * Sort by most book day first
 */
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
		$project: {
			_id: '$_id',
			dateTime: { $add: [new Date(0), '$timeAdded'] },
		},
	},
	{
		$project: {
			dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$dateTime' } },
		},
	},
	{
		$group: {
			_id: '$dateStr',
			count: { $sum: 1 },
		},
	},
	{
		$sort: {
			count: -1,
		},
	},
	{ $out: 'statsdaily2017' },
]);
