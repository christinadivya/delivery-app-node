import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Mailer from '../mail/mailer';
import generator from 'generate-password';
import Schema from '../../../config/mysql.js';
import User from '../models/user.model';
import Tokens from '../../server/models/tokens.model'
import Oauth from '../../server/models/oauth_token.model'
import Receiver from '../models/receiver_details.model';
import Shipment from '../models/shipment_details.model';
import Request from '../models/request.model';
import UserVerifications from '../models/user_verification.model';
import Notifications from '../models/notifications.model';
import notification from '../../config/gcm';
import Twilio from '../../../config/twilio.js';
import Role from '../models/role.model';
import async from 'async';
const moment = require('moment');
import { WSAETIMEDOUT } from 'constants';


function create(req, callback) {  
        console.log("Creating user")
        req.body.email = req.body.email.toLowerCase();
        let otp_code = Math.floor(100000 + Math.random() * 900000);
        let expired_date = new Date();
        expired_date.setHours(expired_date.getHours() + 8);
        if(req.body.mobile) {
          let result = isNaN(req.body.mobile)
          if(result == true) {
            callback({ message: responseMsg.messages.invalidReq , code: responseCode.badRequest }, null)
          }
        }
        if(req.body.password) {
          let patt = new RegExp('(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=(.*[\W]){1,})(?!.*\s).{8,}$')
          let result = /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/.test(req.body.password)
          if(result == false) {
            callback({ message: responseMsg.messages.invalidPass , code: responseCode.badRequest }, null)
          }
        }
        User.forge(req.body)
	        .save()
	        .then((loginuser) => {
            // Notifications.forge({message: responseMsg.messages.twilio.adminNotify, to_user_id: config.config.admin_id, user_id: loginuser.id }).save()
            // .then ((notifications) => {
                // console.log("Notification send to admin");
                const token = jwt.sign({
                id: loginuser.id
            }, config.config.jwtSecret);
            Oauth.forge({token: token, user_id: loginuser.id}).save().then((oauth_token) =>{
                    console.log("Created Token")              
                    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
            UserVerifications.forge({otp_code: otp_code, expired_date: expired_date, user_id: loginuser.id, mobile: loginuser.attributes.mobile }).save().then ((otpuser) => {
            Twilio.sendSms(loginuser.attributes.countrycode+loginuser.attributes.mobile, responseMsg.messages.twilio.activatedCode+
              otpuser.attributes.otp_code);
            User.where({ id: loginuser.id }).fetch().then((users) => {
              Receiver.where({ recipient_phone: users.attributes.mobile }).fetchAll().then((recipient) => {
                let jsonString = JSON.stringify(recipient);
                let finalValue = JSON.parse(jsonString);
                let shipment_id =[];
              if(finalValue.length > 0){
                finalValue.forEach(function(value){
                  shipment_id.push(value.shipment_details_id);
                  // console.log(shipment_id)
                })
                  Shipment.where('id','IN',shipment_id).save({ receiver_id: users.id }, {patch: true }).then((updatedReceiver) => {
                    console.log("Updated");
                  })
                  Request.where('shipment_details_id', 'IN', shipment_id).save({ receiver_id: users.id }, {patch: true }).then((updatedReceiver) => {
                    console.log("Updated Request");
                  })
                  Request.where({ receiver_id: users.id }).fetchAll().then((shipment) => {
                      var jsonString = JSON.stringify(shipment);
                      var requests = JSON.parse(jsonString); 
                      console.log(requests) 
                      requests.forEach((value) =>
                      {
                          Notifications.forge({message: "User "+users.attributes.username+' '+responseMsg.messages.twilio.receiverReq+' '+value.id, to_user_id: users.id, user_id: value.sender_id, request_id: value.id, shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, status_id: 3, notification_type: 3, role_id: 3 }).save()
                          .then ((notifications) => {
                              console.log("Notification send to receiver");
                      })
                      })  
                     
                    })
                 
              }
              else {
                console.log("No request found")
              }
                })
         
              callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.register + otpuser.attributes.otp_code, user: users, token: token } });
            })
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      // }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
}

function login(req, callback) {
  console.log(req);	
  if(req.user.err){    
    callback({ err: { message: req.user.err, code: responseCode.badRequest } }, null);
  } else {
    User.where({id: req.user.id }).fetch().then ((users) => {
      const token = jwt.sign({
              id: req.user.id
            }, config.config.jwtSecret);
            Oauth.where({ user_id: req.user.id, isLogin: 1 }).fetch()
            .then ((token_exists) =>{
                if(token_exists != null) {
                  token_exists.save({ token: token, isLogin: 1 }, { patch: true }).then((updated) => {
                    console.log("Token Updated");
                  })
                }
                else{
                  Oauth
                  .forge({token: token, user_id: req.user.id})
                  .save()
                  .then((oauth_token) =>{
                    console.log("Created Token")              
                    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
                }
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
            callback(null, { code: responseCode.ok, data: {
              token: token,
              userId: req.user.id,
              user: users,
            } }); 
      })
  }    
}

function Login(req,callback) {
  User.where({ email: req.body.email, role: 'admin'}).fetch().then((user) => {
    if(!user) {
      callback({ message: 'Invalid Email/Password', code: responseCode.badRequest }, null);
    }
    else {
      User.comparePassword(req.body.password, user, function (err, valid) {
        if (err) {
          callback({ message: 'Invalid Password', code: responseCode.badRequest }, null);
        }
        if (!valid) {
          callback({ message: 'Invalid Password', code: responseCode.badRequest }, null);
        } 
        else {
          // callback(null, { code: responseCode.ok, data: { message: 'Login Successfully'} });
          const token = jwt.sign({
            id: user.attributes.id
          }, config.config.jwtSecret);
          Oauth.where({ user_id: user.attributes.id, isLogin: 1 }).fetch()
          .then ((token_exists) =>{
              if(token_exists != null) {
                token_exists.save({ token: token, isLogin: 1 }, { patch: true }).then((updated) => {
                  console.log("Token Updated");
                })
              }
              else{
                Oauth
                .forge({token: token, user_id: user.attributes.id})
                .save()
                .then((oauth_token) =>{
                  console.log("Created Token")              
                  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
              }
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
          callback(null, { code: responseCode.ok, data: {
            token: token,
            userId: user.attributes.id,
            user: user,
          } }); 
        }
    })
  }
})
}

function socialLogin(req, callback) {
  const socialInfo = req.body;
  let query;
  if (socialInfo.twitter) {
    query = { twitter: socialInfo.twitter, is_user_active: 1 }  
  } else if (socialInfo.facebook) {
    query = { facebook: socialInfo.facebook, is_user_active: 1}
 }
  User.where(query).fetch().then((user) => {
    if (user) {
    		const token = jwt.sign({
      	id: user.id
        }, config.config.jwtSecret);
        Oauth.where({ user_id: user.attributes.id, isLogin: 1 }).fetch()
          .then ((token_exists) =>{
              if(token_exists != null) {
                token_exists.save({ token: token, isLogin: 1 }, { patch: true }).then((updated) => {
                  console.log("Token Updated");
                })
              }
              else{
                Oauth
                .forge({token: token, user_id: user.attributes.id})
                .save()
                .then((oauth_token) =>{
                  console.log("Created Token")              
                  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
              }
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
	      callback(null, { code: responseCode.ok, data: {
		      token: token,
		      userId: user.id, 
	    	} });
    }
    else {
      callback({ message: responseMsg.messages.userNot , code: responseCode.unauthorised }, null)
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))
 
}


function guestLogin(req, callback) {
	socialLogin(req, callback);
}

function checkEmail(req, callback){
  let email = req.query.email;
 User.query('where', 'email', email.toLowerCase())
  .fetch()
  .then(function(existing) {
    if (existing) {
      callback({ message: responseMsg.messages.emailAlready, code: responseCode.conflict }, null);      
    }else{
      callback(null, { data: { message: true }, code: responseCode.ok })
    }
})
}

function checkPhoneNumber(req, callback){
  let phonenumber = req.query.mobile;
   User.query('where', 'mobile', phonenumber)
  .fetch()
  .then(function (existing) {
    if (existing) {
    	callback({ message: responseMsg.messages.phnAlready, code: responseCode.conflict }, null);      
    }else{
      callback(null, { data: { message: true }, code: responseCode.ok })
    }
})
}


function adminforgotPassword(req, callback) { 
  let otp_code = Math.floor(100000 + Math.random() * 900000);      
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
     User.where({ email: req.query.email, role: 'admin' }).fetch().then((user) => {
       if(!user){
        callback({ message: responseMsg.messages.invalidEmail, code: responseCode.unauthorised }, null);       
     }else { 
      req.query.otp_code = otp_code;          
      UserVerifications.forge({otp_code: otp_code, expired_date: expired_date,user_id: user.id, email: req.query.email }).save().then ((otpuser) => {
        Mailer.sendMail(req.query, 'otpMail', function (err, info){});
        callback(null, { data: { message: responseMsg.messages.checkEmail}, code: responseCode.ok })
     }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));  
     }         
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}

function forgotPassword(req, callback) { 
  let otp_code = Math.floor(100000 + Math.random() * 900000);      
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
     User.forge({ mobile: req.query.mobile }).fetch().then((user) => {
       if(!user){
        callback({ message: responseMsg.messages.invalidReq, code: responseCode.badRequest }, null);       
     }else {   
      if(user.attributes.is_user_active == 1) {
        UserVerifications.forge({countrycode: user.attributes.countrycode,otp_code: otp_code, expired_date: expired_date,user_id: user.id, mobile: req.query.mobile }).save().then ((otpuser) => {
          Twilio.sendSms(user.attributes.countrycode+user.attributes.mobile, responseMsg.messages.twilio.passwordCode+
            otpuser.attributes.otp_code);
          callback(null, { data: { message: responseMsg.messages.checkpho + otp_code }, code: responseCode.ok })
       }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      
   
      } 
      else {
        callback({ message: responseMsg.messages.userNot, code: responseCode.unauthorised }, null);       
      } 
     }         
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}

function verifyOtp(req, callback) {  
  UserVerifications.where('otp_code', req.query.otp_code).where('expired_date', '>', new Date()).where('valid', 1)
  .fetch().then((otp) => {  
     console.log(otp.attributes.otp_code)	
     if(!otp) {
      callback({ message: responseMsg.messages.otpexp, code: responseCode.badRequest })
     } else { 
    otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
        console.log(updateValid)
    })
    User.where({ mobile: otp.attributes.mobile }).fetch().then ((user) => {
      if(!user)
         callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest })
      else
        user.save({ is_user_active: 1 }, { patch: true }).then((updatedUser) => {
      	  const token = jwt.sign({
	        id: updatedUser.id
		    }, config.config.jwtSecret);        
        if(req.query.flag == 1) {
          req.query.email = user.attributes.email;
          req.query.name = user.attributes.username;
          let userInput = {
            email : user.attributes.email,
            name : user.attributes.name.charAt(0).toUpperCase() + user.attributes.name.slice(1),
            path : '/invite.html',
            templateName: 'invite'
          }
          Mailer.sendMail1(userInput, function (err, info){});
        }
        Oauth.where({ user_id: user.id, isLogin: 1 }).fetch()
            .then ((token_exists) =>{
                if(token_exists != null) {
                  token_exists.save({ token: token, isLogin: 1 }, { patch: true }).then((updated) => {
                    console.log("Token Updated");
                  })
                }
                else{
                  Oauth
                  .forge({token: token, user_id: user.id})
                  .save()
                  .then((oauth_token) =>{
                    console.log("Created Token")              
                    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
                }
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
		    callback(null, { code: responseCode.ok, data: {
		      token: token,
          userId: updatedUser.id,
          user: user
		    } });
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
     }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest }, null));
}

function verifyPassOtp(req, callback) {  
  User.where('pass_otp_code', req.query.pass_otp_code).where('pass_expired_date', '>', new Date())
  .fetch().then(user => {  	
     if(!user) {
      callback({ message: responseMsg.messages.otpexp, code: responseCode.badRequest })
     }else {  
      
        callback(null, { code: responseCode.ok, data: { message : responseMsg.messages.otpver } });     
     }         
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function resetPassword(req, callback) {   
  UserVerifications.where('otp_code', req.body.otp_code).where('expired_date', '>', new Date()).where('valid', 1)
  .fetch().then((otp) => {  	
     if(!otp) {
      callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest },null)
     } else { 
        otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
        console.log(updateValid)
      })
        User.where({mobile: otp.attributes.mobile }).fetch().then ((user) => {
          user.save(req.body).then ((updatePassword) => {
            if(!updatePassword)
              callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
            else
             callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.passUpdated }});
        })
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function adminresetPassword(req, callback) {   
  UserVerifications.where('otp_code', req.body.otp_code).where('expired_date', '>', new Date()).where('valid', 1)
  .fetch().then((otp) => {  	
     if(!otp) {
      callback({ message: responseMsg.messages.invalidOtp, code: responseCode.badRequest },null)
     } else { 
        otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
        console.log(updateValid)
      })
        User.where({email: otp.attributes.email }).fetch().then ((user) => {
          user.save(req.body).then ((updatePassword) => {
            if(!updatePassword)
              callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
            else
             callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.passUpdated }});
        })
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }     
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function resendOtp(req, callback) { 
  let otp_code = Math.floor(100000 + Math.random() * 900000);      
  let expired_date = new Date();
  let time =  moment.utc(new Date()).add(5.50, 'h').format("hh:mm a");
  expired_date.setHours(expired_date.getHours() + 8);
     User.forge({ mobile: req.query.mobile }).fetch().then((user) => {
       console.log(user)
       if(!user){
        callback({ message: responseMsg.messages.invalidReq, code: responseCode.badRequest }, null);       
     }else { 
      // async.waterfall([
      //   function(done) {
          UserVerifications.where({ mobile: req.query.mobile, valid: 1 }).fetch().then ((otp) => {
            if(otp) {
              otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
                console.log("***")
                console.log(updateValid)
                // done(null,otp.attributes.country_code)
                UserVerifications.forge({ countrycode: otp.attributes.countrycode, otp_code: otp_code, expired_date: expired_date,user_id: user.id, mobile: req.query.mobile }).save().then ((otpuser) => {
                  Twilio.sendSms(otp.attributes.countrycode+user.attributes.mobile, responseMsg.messages.twilio.passwordCode+
                    otpuser.attributes.otp_code+' created at '+time);
                          callback(null, { data: { message: responseMsg.messages.resendpho + otpuser.attributes.otp_code }, code: responseCode.ok })
      
                    // done(null,otpuser.attributes.otp_code)
               })  
            })
            }
           
          }) 
        // },
        // function(err,done) {
         
      // ], function(err,done){
      //     console.log("Success")

      // })
      
      
     }         
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}


function adminresendOtp(req, callback) { 
  let otp_code = Math.floor(100000 + Math.random() * 900000);      
  let expired_date = new Date();
  expired_date.setHours(expired_date.getHours() + 8);
     User.where({ email: req.query.email, role: 'admin' }).fetch().then((user) => {
       console.log(user);
     if(!user){
        callback({ message: responseMsg.messages.invalidEmail, code: responseCode.badRequest }, null);       
     }else { 
      UserVerifications.where({ email: req.query.email, valid: 1 }).fetch().then ((otp) => {
        if(otp) {
          otp.save({ valid: 0 }, { patch: true }).then ((updateValid) => {
            console.log("***")
            console.log(updateValid);
        })
        }
        req.query.otp_code = otp_code;
        UserVerifications.forge({ email: req.query.email, otp_code: otp_code, expired_date: expired_date,user_id: user.id }).save().then ((otpuser) => {
          Mailer.sendMail(req.query, 'otpMail', function (err, info){});
            callback(null, { data: { message: responseMsg.messages.resendemail}, code: responseCode.ok })
       }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));  
       
      }) 
      
     }         
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null) );
}

function chat_notification(req,callback) {
  notification.chatNotification(req, function(err,response){
      console.log("&&*hjfhdg")
      console.log(response);
      if(err) {
           
          callback({ message: "Not sent", code: responseCode.badRequest }, null);
      }
      else {
          callback(null,{ data: { message: "Sent", status: 200 }, code: responseCode.ok });
      }
  });
}




// function createToken(req, res, next){  
//   DeviceToken.where('user_id', req.user.id).where('token', req.query.regToken).where('device_id', req.query.deviceId).fetch().then(data => {
//     if(!data){
//       DeviceToken.where('device_id', req.query.deviceId).destroy().then(deletedUser => {
//         DeviceToken.forge({user_id: req.user.id, token: req.query.regToken,device_id: req.query.deviceId}).save().then(token =>{
//         if(token){
//           return res.status(200).send({message: 'Token created successfully'});
//         }        
//       }).catch(e => next(e));
//       }).catch(e => next(e));
      
//     }else{
//       return next({message: 'Already token exists', status: 400})
//     }
//   }).catch(e => next(e));   
// }

export default { login, create, checkPhoneNumber, checkEmail, verifyOtp, forgotPassword, 
resetPassword, socialLogin, guestLogin, verifyPassOtp, resendOtp, adminforgotPassword, adminresetPassword, adminresendOtp, Login, chat_notification };
