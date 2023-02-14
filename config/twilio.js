const config = require('./config');
const twilio = require('twilio');

const client = new twilio.RestClient(config.config.twilio.api_key, config.config.twilio.secret_key);
module.exports.sendSms = function (to, body) {
  console.log(to)
  client.sms.messages.create({
    to: to,
    from: '+12196008107',
    body: body
  }, (error, message) => {
    if (!error) {
      console.log('Success! The SID for this SMS message is:');
      console.log(message.sid);
      console.log('Message sent on:');
      console.log(message.dateCreated);
    } else {
      console.log(error);
      console.log('Oops! There was an error.');
    }
  });
};
