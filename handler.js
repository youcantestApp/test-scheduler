var scheduleRepo = require('./repository/scheduleRepository');

var amqp = require('amqplib');

var queueConf = {
	name: "yct.schedule",
	options: {
		durable: true
	}
};

function publishToQueue(conn, itemId) {
		var ok = conn.createChannel();
		ok = ok.then(function(ch) {
			var queue = ch.assertQueue(queueConf.name, queueConf.options);
			var str = JSON.stringify({ scheduleId: itemId });
			ch.sendToQueue(queueConf.name, new Buffer(str));
		});
		return ok;
}

var Handler = function(period) {
	this.period = period;
};

Handler.prototype.execute = function () {
	console.log('executing job for ' + this.period + ' minutes at ' + new Date().toString());

	//getting all scheduled tests in period
	scheduleRepo.getByPeriod(this.period).then(function (list) {
		if(list.length) {
			// amqp.connect('amqp://admin:admin@ec2-52-26-16-39.us-west-2.compute.amazonaws.com').then(function (conn) {
			amqp.connect('amqp://guest:guest@rabbit').then(function (conn) {
				console.log('publishing ' + list.length + ' messages to test queue at ' + new Date().toString());
				for(var i = 0;i<list.length;++i) {
					publishToQueue(conn,list[i]._id.toString());
				}
			}).then(null, console.warn);
		}
	});
};


module.exports.Handler = Handler;
