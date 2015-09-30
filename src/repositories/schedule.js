'use strict';

import BaseRepository from './base'
import q from 'q'

export default class ScheduleRepository extends BaseRepository {
  constructor(config) {
    super(config);
    this.collection = 'schedules';
  }

  getByPeriod(period) {
  	let defer = q.defer();

  	this.getConnection().then((db) => {
  		let collection = db.collection(this.collection);

  		collection.find({ period: period, active: true }).toArray((err, docs) => {
  			if (err != null) {
  				return defer.reject({
            message: `error on find schedules for period ${period} in collection ${this.collection}`,
            error: err
          });
  			}

        db.close();
  			return defer.resolve(docs);
  		});
  	}, (err) => {
      defer.reject(err);
    });

  	return defer.promise;
  }
}
