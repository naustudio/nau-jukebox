// db.getCollection('songs').find({}).count()
db.getCollection('songs').find({timeAdded: { $lt: (new Date("2016-12-31T23:59:59Z")).getTime(), $gt: (new Date("2016-01-01T00:00:00Z")).getTime()} }).count()
