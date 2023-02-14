var paypal = require('paypal-rest-sdk');
// var env_const = require('../config/const.json');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AciJeHSXWA3SHBq0D0R0kkjq6l4nZ5rB6KFZCpCYPAQ9J-ghc-aM6y6cGJsnyGCa58yEgwllzbkVFOGz',
  'client_secret': 'EMnWAdBSfMY3rcndMqwS5BX2BxfQ7PwMd9hf3AMBK8krYh0vDMKUrvGvFb-07hQyCMrZxCGGr6aA4GXZ'
});


// ADAPTIVE PAYMENT CODE:
var PaypalAdaptive = require('paypal-adaptive');
var paypalSdk = new PaypalAdaptive({
    userId:    'p.christinadivya-facilitator-1_api1.gmail.com',
    password:  'AFZENGK4EFZ2XSLQ',
    signature: 'AXlv5viNs2yT2MDR7RbOqxhYiFHrAnD2a8pykBUr70AmEhwhX9C78m8H',
    sandbox:   true, //defaults to false
    appId:     'APP-80W284485P519543T'

});
var request = require('request');


// ADAPTIVE PAYMENT CODE:
module.exports.adaptivePaymentExampleOne = function(data, callback) {
  var payload = {
    requestEnvelope: {
      errorLanguage:  'en_US'
    },
    actionType:     'PAY',
    currencyCode:   'USD',
    feesPayer:      'EACHRECEIVER',
    memo:           'Chained payment example',
    receiverList: {
      receiver: [
        {
          email:  'krithika.k@optisolbusiness.com',
          amount: '100.00',
          primary:'true'
        },
        {
          email:  'aramkumar06@gmail.com',
          amount: '10.00',
          primary:'false'
        }
      ]
    }
  };
 
  paypalSdk.pay(payload, function (err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(response);
    }
  });
}
 
// OR
 
module.exports.adaptivePaymentExampleTwo = function(data, callback){
  var body = JSON.stringify({
    actionType: "PAY",
    receiverList: { 
      receiver: [{
      email: "christinadivyaphilips@gmail.com",
      amount: "1.00"
      },
      ]
    },
    currencyCode: "USD",
    feesPayer: "EACHRECEIVER",
    memo: "This is a test",
    cancelUrl: "http://cancelurl",
    returnUrl: "http://www.mytestapp.com/getPaypalResponse",
    ipnNotificationUrl: "http://your_ipn_notification_url",
    requestEnvelope: {
      errorLanguage: "en_US" 
    }
  });
 
  request.post({
    headers: {
      "X-PAYPAL-SECURITY-USERID": "christinadivyaphilips_api1.gmail.com",
      "X-PAYPAL-SECURITY-PASSWORD": "BM8Y85Y9CBM25AHZ",
      "X-PAYPAL-SECURITY-SIGNATURE": "A7g771vcNWorTkfxbAZBFkjRcD4OAf10s1d73KpAhvQJ0gtQjfrDYxbz",
      "X-PAYPAL-REQUEST-DATA-FORMAT": "JSON",
      "X-PAYPAL-RESPONSE-DATA-FORMAT": "JSON",
      "X-PAYPAL-APPLICATION-ID": "APP-80W284485P519543T",
      "Content-Type": "application/json"
    },
    url: 'https://svcs.sandbox.paypal.com/AdaptivePayments/Pay',
    body: body
  }, function(error, response, body){
      console.log(response)
      console.log(body);
  });
}

