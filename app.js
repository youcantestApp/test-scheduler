var CronJob = require('cron').CronJob;

var Handler = require('./handler').Handler;

var jobs = [
	{ cronTime: '0 */10 * * * *', minutes : 10 },
	{ cronTime: '0 0 */1 * * *', minutes : 60 },
	{ cronTime: '0 0 */12 * * *', minutes : 720 },
	{ cronTime: '0 0 */24 * * *', minutes : 1440 },
	{ cronTime: '0 0 12 * * 0', minutes : 10080 }
];


(function () {
	jobs.forEach(function (job) {
		var actualHandler = new Handler(job.minutes);

		var cron = new CronJob(job.cronTime, actualHandler.execute, null, true, null, actualHandler);
		console.log('starting '+ job.minutes +' cron at ' + new Date().toString());

		cron.start();
	});
})();



