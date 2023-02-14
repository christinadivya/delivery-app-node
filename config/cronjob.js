const cronJob = require('cron').CronJob;
const Note = require('../server/managers/notification.manager');

// exports.sendReminder = function() {
// var textJob = new cronJob( '*/59 * * * * *', function(){
    // console.log('calling')
// sec(0-59) min(0-59) hrs(0-23) dayMon(1-31) mon(0-11) dayWeek(0-6) : 0 0 0 1 0-11 *
// Note.sendReminder();
// }, null, true);
// textJob.start();
// };

module.exports.pickReminder = () => {
    var textJob = new cronJob('0 0 * * *', function(){
    console.log('calling')
    Note.pickReminder();
    }, null, true);
    textJob.start();
}

module.exports.dropReminder = () => {
    var textJob = new cronJob('0 0 * * *', function(){
    console.log('calling')
    Note.dropReminder();
    }, null, true);
    textJob.start();
}
