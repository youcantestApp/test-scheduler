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
    this[scheduleRepo].getByPeriod(this[configs].period).then((list) => {
  		if(!list || list.length === 0) {
        console.log(`none scheduled test for period ${this[configs].period}`);
        process.exit();
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
            setTimeout(() => {
              process.exit();
            }, 5000);
          },() => {
            console.log('some errors on publish');
            process.exit();
          })
        }
        catch (err) {
          console.log('error on publish queue messages', err);
          process.exit();
        }
      },(err) => {
        console.log('error on prepare', err);
        process.exit();
      });
    });
  }
}
