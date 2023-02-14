import User from '../models/user.model';
import UserVerifications from '../models/user_verification.model';
import Shipment from '../models/shipment_details.model';
import Notifications from '../models/notifications.model'
import Receiver from '../models/receiver_details.model';
import Request from '../models/request.model';
import Card from '../models/card_details.model';
import Tokens from '../../server/models/tokens.model'
import Transaction from '../../server/models/transaction.model'
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import config from '../../../config/config';
import braintree from '../../../config/braintree.js'
import notification from '../../config/gcm';
import Mailer from '../mail/mailer';
import Twilio from '../../../config/twilio.js';
import pick from 'lodash.pick';
import http from 'http';
import rp from 'request-promise';
import request from 'request';
import jwt from 'jsonwebtoken';
import async from 'async';
const moment = require('moment');

function deals (req) {
  console.log(req)
  console.log("hai");
  for( var i= 0; i< req.length; i++) {
    User.where( { id: req[i] }).fetch().then((user) => {
      user.save({ deals: user.attributes.deals + 1 },{ patch : true }).then((updatedDeals) => {
        console.log("deals updated");
      })
    })
  }
  
}
function generateOtp(req, callback) {
  let otp_code = Math.floor(100000 + Math.random() * 900000);      
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
  switch(req.query.generateOtp) {
    case "1": {
      User.forge({ id: req.user.id }).fetch().then((user) => {
        if (!user) {
          callback({ message: responseMsg.messages.invalidUser, code: responseCode.badRequest }, null);
        }
        else {       
          UserVerifications.forge({ otp_code: otp_code, expired_date: expired_date, user_id: req.user.id, mobile: user.attributes.mobile }).save().then ((otpuser) => {
            Twilio.sendSms(user.attributes.countrycode+user.attributes.mobile, responseMsg.messages.twilio.passwordCode+
              otpuser.attributes.otp_code);
          callback(null, { data: { message: responseMsg.messages.checkpho + otp_code }, code: responseCode.ok })
         }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));  
        }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      break;
    }

    default : { callback({ message: responseMsg.messages.genOtp, code: responseCode.badRequest }, null); break;}
  } 

}

function changePassword(req,callback) {
  UserVerifications.where('otp_code', req.body.otp_code).where('user_id',req.user.id).where('expired_date', '>', new Date())
  .fetch().then((otp) => {  	
     if(!otp) {
      callback({ message: responseMsg.messages.otpexp, code: responseCode.badRequest },null)
     } else { 
    User.where({ id: req.user.id }).fetch().then ((user) => {
      if(!user)
         callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
      else {
        user.save(req.body).then ((updatePassword) => {
          if(!updatePassword)
            callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
          else
           callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.passUpdated }});
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function changeMobile(req, callback) {
    User.forge({ id: req.user.id }).fetch().then((user) => {
      if (!user) {
       callback({ message: responseMsg.messages.invalidUser, code: responseCode.badRequest }, null);
      }
      else {
        User.where({ mobile: req.body.mobile }).fetch().then((alreadyExist) => {
          if(alreadyExist) {
            console.log(alreadyExist);
            callback({ message: responseMsg.messages.mobExist, code: responseCode.badRequest },null)
          }
          else {
            console.log(req.body)
            let otp_code = Math.floor(100000 + Math.random() * 900000);
            let expired_date = new Date();
            expired_date.setHours(expired_date.getHours() + 8);
            UserVerifications.forge({countrycode: req.body.countrycode, otp_code: otp_code, expired_date: expired_date, user_id: req.user.id, mobile: req.body.mobile }).save().then ((otpuser) => {
            Twilio.sendSms(req.body.countrycode+req.body.mobile, responseMsg.messages.twilio.PhoneNumber+
            otpuser.attributes.otp_code);
           
              callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.twilio.PhoneNumber + otpuser.attributes.otp_code } });
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
        }
      })
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function verifyOtpMobileChange(req,callback) {
  UserVerifications.where('otp_code', req.body.otp_code).where('user_id',req.user.id).where('valid',1).fetch().then((otp) => {  	
     if(!otp) {
      callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest },null)
     } else { 
    User.where({ id: req.user.id }).fetch().then ((user) => {
      if(!user)
         callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
      else {
        user.save({ countrycode: otp.attributes.countrycode, mobile: otp.attributes.mobile }).then ((updateMobile) => {
          if(!updateMobile)
            callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
          else {
            otp.save({ valid: 0 },{ patch: true }).then((otpUpdated) => {
              callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.mobileUpdate }});
            })
          }
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}


function get(req, res) {
  return res.json(req.user);
}

function verifyService(req, otp, date, callback) {
  const user = req.user;
  const otp_code = Math.floor(100000 + Math.random() * 900000);
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
  const opt = {};
  opt[otp] = otp_code;
  opt[date] = expired_date;
  user.save(opt, { patch: true }).then((updatedUser) => {
    callback(null, true);
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function verifyPhone(req, callback) {
  verifyService(req, 'number_otp_code', 'number_expired_date', (err, data) => {
    if (err) {
      callback(err);
    } else {
			callback(null, { code: responseCode.ok,
				data: { message: responseMsg.messages.checkpho + req.user.attributes.number_otp_code } });
			Twilio.sendSms(req.query.phonenumber,
				responseMsg.messages.twilio.PhoneNumber + req.user.attributes.number_otp_code);
    }
  });
}

function verifyEmail(req, callback) {
  verifyService(req, 'email_otp_code', 'email_expired_date', (err, data) => {
    if (err) {
      callback(err);
    } else {
			callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.checkemail }});
      Mailer.sendMail({email: req.query.email, email_otp_code: req.user.attributes.email_otp_code },
				'activeMail', function (error, info) {});
  	}
  });
}

function validateService(param, code, date, codeValue, value, callback) {
  User.where(code, codeValue).where(date, '>', new Date()).fetch().then((user) => {
    if (!user) {
      callback({message: responseMsg.messages.otpexp, code: responseCode.badRequest });
    } else {
			  const opt = {};
        opt[param] = value;
        user.save(opt, { patch: true }).then((updatedUser) => {
          callback(null, true);
		    })
		    .catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
	  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function validateEmail(req, callback) {
	validateService('email', 'email_otp_code', 'email_expired_date',
	req.query.code, req.query.email, (err, data) => {
    if (err) {
      callback(err);
    } else {
			callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.emailUpdate } });
		}
	});
}

function validateNumber(req, callback) {
  validateService('phonenumber', 'number_otp_code', 'number_expired_date',
	req.query.code, req.query.phonenumber, (err, data) => {
		if (err) {
			callback(err);
    } else {
			callback(null, { code: responseCode.ok,
				data: { message: responseMsg.messages.numberUpdate } });
    }
  });
}

function editProfile(req, callback) {
  User.forge({ id: req.user.id }).fetch().then((user) => {
    if(user) {
      if(req.body.govt_id_exp_date) {
        req.body.govt_id_exp_date = moment.utc(req.body.govt_id_exp_date).format('YYYY-MM-DD hh:mm:ss');
      }
      user.save(req.body, { patch: true }).then((updatedUser) => {
        User.where({ id: req.user.id }).fetch().then ((users) => {
          callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.proUpdate, user: users } })
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function getProfile(req, callback) {
  User.forge({ id: req.user.id })
  .fetch()
  .then((user) => {
    callback(null, { data: user, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function selectRole(req,callback) {
  User.where({ id: req.user.id }).fetch().then ((user) => {
    callback(null, { code: responseCode.ok, data: {
      user_id: req.user.id,
      role_id: req.body.role_id,
      token: jwt.sign({
        id: req.user.id,
        role_id: req.body.role_id,
      }, config.config.jwtSecret)
    }
     })
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}

function receiverAccept(req,callback) {
  User.where({ id: req.user.id }).fetch().then ((users) => {        
    Request.where({ id: req.body.request_id, receiver_id: req.user.id }).fetch({ withRelated: ['sender', 'carrier', 'receiver'] }).then ((statusChecked) => {
      var jsonString = JSON.stringify(statusChecked);
      var status = JSON.parse(jsonString);
      console.log(status);
      let otp_code = Math.floor(100000 + Math.random() * 900000); 
      let receiver_otp_code = Math.floor(100000 + Math.random() * 900000); 
      let userInput;
      if(statusChecked) {
        switch(req.body.flag) {
          case 1: {
            Request.where({ shipment_details_id: status.shipment_details_id, status_id: 8 }).save( { status_id: 4, label: responseMsg.messages.inProg, receiver_id: req.user.id, sender_otp_code: otp_code }, { patch: true }).then ((statusAccepted) => {
              console.log("Generate code");
                let message = "User "+status.receiver.username+' '+responseMsg.messages.receiverConfirmed+' '+req.body.request_id
                // Notification to sender
                  UserVerifications.forge({ pick_otp_code: otp_code, request_id: req.body.request_id, user_id: status.carrier.id }).save().then ((otpsender) => {
                    notification.sendNotification({ message: message, to_user_id: [status.sender.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, notification_type: 6, sender_id: status.sender.id, carrier_id: status.carrier.id, role_id: 2, otp: otp_code, status_id: 4})
                              console.log('Notifications saved');
                              userInput = { otp : otp_code,
                                email: status.sender.email,
                                name : status.sender.name.charAt(0).toUpperCase() + status.sender.name.slice(1),
                                deal: req.body.request_id,
                                path : '/codeMail.html',
                                templateName: 'codeMail' }
                    Mailer.sendMail1(userInput,function (err, info){});
                    Request.where({ shipment_details_id: status.shipment_details_id }).save({ receiver_otp_code: receiver_otp_code}, { patch: true }).then((receiverOtp) => {
                // Notification send to receiver
                      UserVerifications.forge({ drop_otp_code: receiver_otp_code, request_id: req.body.request_id, user_id: status.carrier.id }).save().then ((otpreceiver) => {
                        notification.sendNotification({ message: message, to_user_id: [status.carrier.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, notification_type: 6, sender_id: status.sender.id, carrier_id: status.carrier.id, role_id: 4, otp: otp_code, status_id: 4})
                              console.log('Notifications saved');
                              userInput = { otp : receiver_otp_code,
                                email: status.receiver.email,
                                name : status.receiver.name.charAt(0).toUpperCase() + status.receiver.name.slice(1),
                                deal: req.body.request_id,
                                path : '/receiveMail.html',
                                templateName: 'receiveMail'  }
                              Mailer.sendMail1(userInput, function (err, info){});
      
                      })
                    })

                //  Transaction table 
                                         
                Transaction.forge({
                  request_id: req.body.request_id,
                  sender_id: status.sender_id,
                  carrier_id: status.carrier_id,
                  receiver_id: status.receiver_id,
                  shipment_details_id: status.shipment_details_id
                }).save().then((transaction) => {
                  console.log("Inserted Transaction Detail");
                })
              
                    

                              // Twilio.sendSms(status.carrier.countrycode+status.carrier.mobile, message)
                              // Twilio.sendSms(status.sender.countrycode+status.sender.mobile, responseMsg.messages.OtpStart+ otp_code )
                             
                              callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.checkemail } })                   
                  })
             
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
        }break;
  
        case 2: {
          let comments;
          if(req.body.comments) {
            comments = req.body.comments;
          }
          else  
            comments = "";
          console.log("Rejected");
          statusChecked.save({status_id: req.body.status_id, reason: req.body.reason, label: responseMsg.messages.rejectReceiver, comments: comments }).then ((statusUpdated) => {
              let message = "User "+status.receiver.username+' '+responseMsg.messages.twilio.rejectReceiver+' '+req.body.request_id
              console.log(message);
              notification.sendNotification({ message: message, to_user_id: [status.sender.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, notification_type: 9, sender_id: status.sender.id, carrier_id: status.carrier.id, role_id: 2, status_id: 7})
              notification.sendNotification({ message: message, to_user_id: [status.carrier.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, notification_type: 9, sender_id: status.sender.id, carrier_id: status.carrier.id, role_id: 4, status_id: 7})
              console.log('Notifications saved');
              Notifications.forge({ message: "Reject Parcel for the deal number "+req.body.request_id , to_user_id: config.config.admin_id, user_id: req.user_id, notification_type: 16, request_id: req.body.request_id }).save()
              .then((notification) => {
                  console.log('Admin Notifications saved');
                }).catch(e => console.log(e))
              // Twilio.sendSms(status.carrier.countrycode+status.carrier.mobile, message)
              callback(null,{ data:{ message: responseMsg.messages.rejectReq },code: responseCode.ok  } ) 
              })  
        }break;
        }
      }
      else {
        callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null)
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
  }

function verifyPickupCode(req,callback) {
    UserVerifications.where( { pick_otp_code: req.body.otp_code, valid: 1, user_id: req.user.id }).fetch().then ((verify) => {
      if(verify) {
        console.log(req.user.id) 
        Request.where({ id: verify.attributes.request_id }).fetchAll({ withRelated: ['receiver', 'sender', 'carrier'] }).then((request) =>{
          Request.where({ id: verify.attributes.request_id }).save({ status_id: 4, label: responseMsg.messages.inProg, verify_pick_up: 1 },{ patch: true }).then ((updated) => {
            var jsonString = JSON.stringify(request);
            var requests = JSON.parse(jsonString);
            // console.log(requests[0].shipment_details_id)
            verify.save({ valid: 0}, { patch: true }).then ((validUpdated) => {
                      console.log("Code verified");
                      let message = responseMsg.messages.carPickup+' '+responseMsg.messages.twilio.orderId+' '+verify.attributes.request_id
                      // Notification to receiver
                          notification.sendNotification({ message: message, to_user_id: [requests[0].receiver.id], user_id: req.user.id, request_id: [verify.attributes.request_id], shipment_details_id: requests[0].shipment_details_id, notification_type: 12,  sender_id: requests[0].sender.id, carrier_id: requests[0].carrier.id, receiver_id: requests[0].receiver.id, role_id: 3, status_id: 4, notification_type: 12 })
                          notification.sendNotification({ message: message, to_user_id: [requests[0].sender.id], user_id: req.user.id, request_id: [verify.attributes.request_id], shipment_details_id: requests[0].shipment_details_id, notification_type: 12, sender_id: requests[0].sender.id, carrier_id: requests[0].carrier.id, receiver_id: requests[0].receiver.id, role_id: 2, status_id: 4, notification_type: 12 })
                          callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.otpver } })            
                    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
                 }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
        
        })
      }
      else {
        callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest }, null)
      }         
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            

  }

function verifyDeliverCode(req,callback) {
    UserVerifications.where( { drop_otp_code: req.body.otp_code, valid: 1, user_id: req.user.id }).fetch().then ((verify) => {
      if(verify) {
        console.log(req.user.id) 
        Request.where({ id: verify.attributes.request_id }).fetchAll({ withRelated: ['carrier','receiver', 'sender'] }).then((request) =>{
          Request.where({ id: verify.attributes.request_id }).save({ status_id: 5, label: responseMsg.messages.delivered, verify_delivery: 1  },{ patch: true }).then ((updated) => {
            var jsonString = JSON.stringify(request);
            var requests = JSON.parse(jsonString);
            verify.save({ valid: 0}, { patch: true }).then ((validUpdated) => {
              let id = [requests[0].sender.id, requests[0].carrier.id, requests[0].receiver.id];
              deals(id); // Number of deals for each has been increased
              let message = responseMsg.messages.delivered+' '+responseMsg.messages.twilio.orderId+' '+verify.attributes.request_id
              // Notifications to sender, carrier and receiver
                notification.sendNotification({ message: message, to_user_id: [requests[0].sender.id], user_id: req.user.id, request_id: [verify.attributes.request_id], shipment_details_id: requests[0].shipment_details_id, notification_type: 10, sender_id: requests[0].sender.id, carrier_id: requests[0].carrier_id, receiver_id: requests[0].receiver.id, role_id: 2,  status_id: 5, notification_type: 10  })
                notification.sendNotification({ message: message, to_user_id: [requests[0].carrier.id], user_id: req.user.id, request_id: [verify.attributes.request_id], shipment_details_id: requests[0].shipment_details_id, notification_type: 10, sender_id: requests[0].sender.id, carrier_id: requests[0].carrier_id, receiver_id: requests[0].receiver.id, role_id: 4,  status_id: 5, notification_type: 10 })
                notification.sendNotification({ message: message, to_user_id: [requests[0].receiver.id], user_id: req.user.id, request_id: [verify.attributes.request_id], shipment_details_id: requests[0].shipment_details_id, notification_type: 10, sender_id: requests[0].sender.id, carrier_id: requests[0].carrier_id, receiver_id: requests[0].receiver.id, role_id: 3,  status_id: 5, notification_type: 10 })
          // Chat history delete
          let url = 'http://13.126.155.93:9002/api/chatrooms/deleteRooms'
          let propertiesObject = {
            query: `CALL delete_logs('`+requests[0].sender.id+'&'+ requests[0].carrier.id+'&'+ requests[0].id+`',`+`'`+requests[0].sender.id+'&'+ requests[0].receiver.id+'&'+ requests[0].id+`'`+`,`+`'`+
            requests[0].carrier.id+'&'+ requests[0].sender.id+'&'+ requests[0].id+`'`+`,`+`'`+requests[0].carrier.id+'&'+ requests[0].receiver.id+'&'+ requests[0].id+`'`+`,`+`'`
            +requests[0].receiver.id+'&'+ requests[0].sender.id+'&'+ requests[0].id+`','`+requests[0].receiver.id+'&'+ requests[0].carrier.id+'&'+ requests[0].id+`'`+`)`,
            isGroup: false
          }

          rp({
            url: url,
            'Content-type': 'application/json',
            method: 'POST',
            json: true,
            body: propertiesObject
          })
          .then((response) => {
            // console.log("Error",req)
            console.log('success', response);
          })
                      callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.otpver } }) 
                    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
                 }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))              
        })
      }

      else {
        callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest }, null)
      }         
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            

}
  
function cardDetails(req,callback) {
   req.body.user_id = req.user.id;
   Card.forge(req.body).save().then ((cardDetails) => {
    callback(null, { code: responseCode.ok, data: cardDetails })
   }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)) 
}

function logout(req,callback) {
  User.where({ id: req.user.id }).fetch().then ((user) => {
    if(user) {
      Tokens.where({ user_id: req.user.id, isLogin: 1 }).fetch().then((tokens) => {
        if(tokens != null) {
          tokens.destroy().then((token_destroyed) => {
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.logout } });
          })
        }
        else {
          callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
        }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)) 
    }
    else {
      callback({ message: responseMsg.messages.nouser, code: responseCode.badRequest },null)
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)) 
}

function resendOtp(req, callback) { 
  let otp_code = Math.floor(100000 + Math.random() * 900000);      
  let expired_date = new Date();
  let time = moment.utc(new Date()).add(5.50,'h').format('hh:mm a');
  expired_date.setHours(expired_date.getHours() + 8);
      UserVerifications.where({ mobile: req.query.mobile, valid: 1 }).fetch().then ((otp) => {
        if(otp) {
          otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
            console.log("***")
            console.log(updateValid);
            UserVerifications.forge({ countrycode: otp.attributes.countrycode, otp_code: otp_code, expired_date: expired_date,user_id: otp.attributes.user_id, mobile: req.query.mobile }).save().then ((otpuser) => {
              Twilio.sendSms(otp.attributes.countrycode+req.query.mobile, responseMsg.messages.twilio.PhoneNumber+
                otpuser.attributes.otp_code+' created at '+ time);
                callback(null, { data: { message: responseMsg.messages.resendpho + otp_code }, code: responseCode.ok })
           }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));  
        })
       
      }
      }) 
}

function payment(req,callback) {
  console.log("Payment Check");
  // paypal.adaptivePaymentExampleTwo(req.user.id);
  braintree.paymentModel({ amount: 20.00, method: "fake-valid-nonce" });
  callback(null, { code: responseCode.ok, data: { message: "Payment check" } })

}

function remove(req,callback) {
  console.log("Delete Check");
  let status_id = [];
  User.where({ id: req.user.id }).fetch().then((user) => {
     if(user) {
       let query = function(qb) {
         qb.orWhere({ sender_id: req.user.id })
         qb.orWhere({ carrier_id: req.user.id })
         qb.orWhere({ receiver_id: req.user.id })
       }
       Request.query(query).fetchAll().then((status) => {
        var jsonString = JSON.stringify(status);
        var requests = JSON.parse(jsonString);
        console.log(requests)
        if(requests.length > 0) {
          async.waterfall([ 
            function(done){
              for(let i = 0; i < requests.length; i++) {
                status_id.push(requests[i].status_id)
                if(i == requests.length - 1) {
                    let result = status_id.includes(4)
                    if(result == true) {
                      callback({ message: "Please complete all your on-going shipment to delete your account" , code: responseCode.badRequest },null)
                    }
                    else {
                      user.save({ is_delete: 1}, { patch: true}).then((deleted) => {
                            callback(null, { code: responseCode.ok, data: { message: "Account deleted" } })
                           })
                    }
                }
              }
            }
            ],function(err,done) {

            })
        }
        else {
          user.save({ is_delete: 1}, { patch: true}).then((deleted) => {
            callback(null, { code: responseCode.ok, data: { message: "Account deleted" } })
           })
        }
       
       })
       
     }
  });
}


export default { get, changePassword, verifyPhone, verifyEmail,
  validateNumber, validateEmail, editProfile, getProfile, changeMobile, verifyOtpMobileChange, generateOtp, selectRole, receiverAccept, verifyPickupCode, verifyDeliverCode, cardDetails, logout, payment, resendOtp, remove };
