'use strict';

import fs from 'fs';
import * as _ from 'lodash';
import SchedulerHandler from './scheduler-handler';
import { argv } from 'yargs';

let loadJSON = (name) => {
  let content = {};

  try {
    content = fs.readFileSync(name);
    content = JSON.parse(content);
  }
  catch (err) {
    console.log(`loading default configuration for filename ${name}`);
  }

  return content;
}

let defaultConfig = loadJSON('config/all.json');
let envConfig = {};
if(process.env.NODE_ENV === 'production') {
  envConfig = loadJSON(`config/production.json`);
}
else {
  envConfig = loadJSON(`config/development.json`);
}

let period = argv.p.trim() || 5;
try {
  period = parseInt(period);
}catch(err) {
  period = 5;
}

let config = _.extend({}, defaultConfig, envConfig, {period : period});

var handler = new SchedulerHandler(config);

console.log(`starting handler for period=${period} at ${new Date().toString()}`);
console.log(`${process.env.cron_restart}  value of cron_Restart`);

handler.execute();
