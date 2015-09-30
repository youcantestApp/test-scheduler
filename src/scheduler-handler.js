'use strict';

import q from 'q';

import ScheduleRepository from './repositories/schedule';
import QueueService from './services/queue';

let configs = Symbol(), scheduleRepo = Symbol(), queueService = Symbol();

export default class SchedulerHandler {
  constructor(config) {
    this[configs] = config;
    this[scheduleRepo] = new ScheduleRepository(config);
    this[queueService] = new QueueService({
      connection: this[configs].connections.queue,
      queue: this[configs].queues.schedule
    });
  }

  execute() {
    let defer = q.defer();

    this[scheduleRepo].getByPeriod(this[configs].period).then((list) => {
  		if(!list || list.length === 0) {
        console.log(`none scheduled test for period ${this[configs].period}`);
        defer.reject({message: 'none to schedule'});
      }

      this[queueService].prepare().then((msg) => {
        console.log("prepared", msg);
        try {
  				console.log(`publishing ${list.length} messages to test queue at ${new Date().toString()}`);
          let arr = [];
  				for(let i = 0;i<list.length;++i) {
            let str = JSON.stringify({ scheduleId: list[i]._id.toString() });
            arr.push(this[queueService].publishMessage(str));
  				}

          q.all(arr).then(() => {
            console.log('all published');
            defer.resolve({message: 'success all published'});
          },() => {
            console.log('some errors on publish');
            defer.reject({message: 'error on publish'});
          })
        }
        catch (err) {
          console.log('error on publish queue messages', err);

          defer.reject({message: 'error on publish queue messages'});
        }
      },(err) => {
        console.log('error on prepare', err);

        defer.reject({message: 'error on prepare'});
      });
    });

    return defer.promise;
  }
}
