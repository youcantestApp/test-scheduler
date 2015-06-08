var base = require("./baseRepository"), q = require('q');

var collectionName = 'schedules';

var getByPeriod = function (period) {
	var defer = q.defer();

	base.connect().then(function (db) {
		var collection = db.collection(collectionName);

		collection.find({ period: period }).toArray(function (err, docs) {
			if (err != null) {
				return defer.reject("unable to find -> error:" + err.message);
			}
			base.close();

			defer.resolve(docs);
		});
	});

	return defer.promise;
};

module.exports.getByPeriod = getByPeriod;
