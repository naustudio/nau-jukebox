db.getCollection('songs').aggregate(
    [ 
        { "$match": {
            timeAdded: { 
                $lt: (new Date("2016-12-31T23:59:59Z")).getTime(), 
                $gt: (new Date("2016-01-01T00:00:00Z")).getTime() 
            } 
        } },
        { "$group":  { 
            "_id": "$name", 
            "count": { "$sum": 1 }, 
            "name": { "$first": "$name" },
            "artist": { "$first": "$artist" }
        }},
        { "$sort": { 
            count: -1 
        } },
        { $out : "stats2016" }
    ]);
       