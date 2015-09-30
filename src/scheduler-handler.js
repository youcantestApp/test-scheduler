'use strict';

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
        return;
      }

      this[queueService].prepare().then((msg) => {
        console.log("prepared", msg);
        try {
  				console.log(`publishing ${list.length} messages to test queue at ${new Date().toString()}`);
  				for(var i = 0;i<list.length;++i) {
            this[queueService].publishMessage(list[i]._id.toString());
  				}
        }
        catch (err) {
          console.log('error on publish queue messages', err);
        }
        finally {
          process.exit();
        }
      },(err) => {
        console.log('error on prepare', err);
        process.exit();
      });
    });
  }
}
