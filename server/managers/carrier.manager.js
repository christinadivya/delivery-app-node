import Schema from '../../../config/mysql.js';
import Carrier from '../models/carrier_details.model';
import User from '../models/user.model';
import UserVerifications from '../models/user_verification.model';
import Shipment from '../models/shipment_details.model';
import Twilio from '../../../config/twilio.js';
import Notifications from '../models/notifications.model'
import Request from '../models/request.model';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import config from '../../../config/config';
import notification from '../../config/gcm';
import Mailer from '../mail/mailer';
import pick from 'lodash.pick'
import async from 'async';
import moment from 'moment';
const _ = require('lodash'); 

function carrierCreate(req, callback) {
    req.body.user_id = req.user.id
    req.body.total = parseFloat(req.body.rate)+parseFloat(req.body.extra_charge)+'$'
    req.body.pick_up_date = moment.utc(req.body.pick_up_date).format('YYYY-MM-DD hh:mm:ss');
    req.body.drop_off_date = moment.utc(req.body.drop_off_date).format('YYYY-MM-DD hh:mm:ss');
    let carrier_params = pick(req.body, ['user_id', 'source_location', 'pick_up_lat', 'pick_up_lon', 'destination','drop_off_lat','drop_off_lon','pick_up_date', 'time_of_pick_up', 'kg_to_carry', 'rate', 'extra_charge', 'total', 'weight_details_id', 'drop_off_date', 'drop_odd_time'])
    User.where({ id: req.user.id }).fetch().then ((users) => {
      console.log(users);
      // if(users.attributes.verify == 0 ) {
      //           callback({ message: responseMsg.messages.govtVer, code: responseCode.unauthorised }, null);
      //   }     
      // else {
    // if(req.body.drop_off_date > req.body.pick_up_date)
    //    console.log("Greater")
    Carrier.forge(carrier_params)
    .save()
    .then((carrier) => {
        if(carrier) {
          Carrier.forge({id: carrier.attributes.id, user_id: req.body.user_id }).fetch({ withRelated: ['user']})
          .then((carrierCreated) => {
            console.log(req.body.role)
            callback(null, { data: {carrier: carrierCreated, role: req.body.role_id }, code: responseCode.ok });
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }
   }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  // }
 })
}

function getCarrier(req, callback) {
    Carrier.where({ id: req.query.post_id })
    .fetch({ withRelated: ['user', 'weight_details']})
    .then((carrier) => { 
      callback(null, { data: carrier, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function getAllCarrier(req, callback) {

  Carrier.where({ id: req.user.id })
   .fetchAll({ withRelated: ['user']})
   .then((carrier) => {
     callback(null, { data: carrier, code: responseCode.ok });
   }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
 
 }

function editCarrier(req, callback) {
    let carrier_id = req.body.id;
    Carrier.where({ user_id: req.user.id, id: carrier_id }).fetch({ withRelated: ['user']}).then((carrier) => {
      if(carrier) {
        carrier.save(req.body, { patch: true }).then((updateCarrier) => {
          Carrier.where({ user_id: req.user.id, id: carrier_id }).fetch({ withRelated: ['user']}).then ((carriers) => {
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.carrUpdate, data: carriers } })
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
      else {
        callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}


function pickupLocation(req, callback) {
  
    let pick_lat,pick_lon,drop_lat,drop_lon,pick_up_date;
  
    Carrier.where( { id: req.query.carrier_id, user_id: req.user.id }).fetchAll({ withRelated: ['user'] }).then((carriers) => {
      if(carriers) {
          // console.log(shipments)
          let jsonString = JSON.stringify(carriers);
          let finalValue = JSON.parse(jsonString);
          console.log(finalValue)
        if(finalValue[0] !=null || finalValue[0] != undefined){
          pick_lat = finalValue[0].pick_up_lat;
          pick_lon = finalValue[0].pick_up_lon;
          drop_lat = finalValue[0].drop_off_lat;
          drop_lon = finalValue[0].drop_off_lon;
          pick_up_date = moment(finalValue[0].pick_up_date).format('YYYY-MM-DD');
          let setQuery = `CALL nearby_sender(`+pick_lat+`,`+pick_lon+`,`+drop_lat+`,`+drop_lon+`,`+`'`+pick_up_date+`'`+`)`;
          setQuery = setQuery.toString();
          console.log(setQuery)
          Schema.Bookshelf.knex.raw([setQuery]).then((response) => { 
            if(response) { 
             var jsonString = JSON.stringify(response[0][0]);
             var finalObject = JSON.parse(jsonString);
             if(req.query.flag == 1) {
              callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.carrList, data: finalObject, role: req.query.role_id} })
             }
             else {
                if(!req.query.search) {
                  callback( { message: responseMsg.messages.searchParam, code: responseCode.badRequest },null);
                }
                else {
                  let result = _.filter(finalObject, item => item.username == req.query.search);
        if(result)         
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.carrList, data: result, role: req.query.role_id} })
        else
            callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
                }
             }
            }
            else{
              callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
            }
            })
      }
      else {
        callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }
    }
      else {
        callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }
        
    })
  
  }

function getSenderDetail(req, callback) {
    let shipment_id = req.query.shipment_id;
    Shipment.where({id: shipment_id }).fetch({ withRelated: ['user', 'package', 'package_doc', 'container_size_details', 'weight_details', 'receiver', 'status'] }).then ((shipments) => {
      if(shipments) {
        callback(null, { code: responseCode.ok, data: shipments })
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

function requestSender(req, callback) { 
  let user_ids = [];
  let name, receiver_id;
  req.body.shipment_id.forEach((value) => {
    Request.where({ carrier_id: req.user.id, carrier_details_id: req.body.carrier_post_id, shipment_details_id: value }).fetch().then((requests) => {
      console.log(requests)
      if(requests) {
       callback({ message: "Invite sent already", code: responseCode.badRequest }, null)

      }
      else {
  Request.where({ carrier_details_id: req.body.carrier_post_id, status_id: 2 }).fetch().then ((statusChecked) =>{
   if(statusChecked) {
      callback({ message: responseMsg.messages.noCarrier , code: responseCode.badRequest }, null)
  }
   else {
    User.where({ id: req.user.id }).fetch().then ((users) => {
     name = users.attributes.username;
    //  console.log(req.user.id)
     async.waterfall([
      function(done){
        var id = [];
        req.body.shipment_id.forEach(function(value){
          Shipment.where({ id: value }).fetch({ withRelated: ['user'] }).then ((users) => {
            var jsonString = JSON.stringify(users);
            var finalObject = JSON.parse(jsonString);
            if(req.body.modify_price != null || req.body.modify_price != undefined) {
              users.save({ negotiable_price: req.body.modify_price }, { patch: true }).then((updatedPrice) => {
                     console.log(("Modified price"));
                })
             }

              Request.forge({
                carrier_id: req.user.id,
                sender_id: users.attributes.user_id,
                receiver_id: users.attributes.receiver_id,
                carrier_details_id: req.body.carrier_post_id,
                shipment_details_id: value,
                status_id: req.body.status_id,
                role_id: req.body.role_id,
                label: responseMsg.messages.senderAccept
              }).save().then ((request) => {
                console.log("Sender request saved");
                id.push({
                  request_id: request.id,
                  to_user_id: users.attributes.user_id,
                  shipment_details_id: value,
                  message: "User "+name+' '+responseMsg.messages.twilio.carrierReq+' '+request.id,
                  mobile: finalObject.user.mobile,
                  countrycode: finalObject.user.countrycode
                })
                if(id.length == req.body.shipment_id.length) {
                  // console.log(id)
                  done(null, id)
                }
              })
            })
    })
    },
   function(id,done) {
        let request_id = [], to_user_id = [], message;
        id.forEach(function(value) {
          to_user_id.push(value.to_user_id);
          request_id.push(value.request_id);
          message = value.message;
          // Twilio.sendSms(value.countrycode+value.mobile, value.message)
          if(id.length == request_id.length) {
              console.log('Notifications saved');
              if(req.body.modify_price != null || req.body.modify_price != undefined) {
                notification.sendNotification({ message: "User"+' '+name+' '+responseMsg.messages.negPrice+' '+request_id,
                  to_user_id: to_user_id, user_id: req.user.id, shipment_details_id: value.shipment_details_id, carrier_details_id:  req.body.carrier_post_id, request_id: request_id, notification_type: 13, status_id: 3, role_id: 2 })
              }
              else {
                notification.sendNotification({ message: message,
                  to_user_id: to_user_id, user_id: req.user.id, shipment_details_id: value.shipment_details_id, carrier_details_id:  req.body.carrier_post_id, request_id: request_id, notification_type: 2, status_id: 3, role_id: 2 })
              }
                  done(null,request_id);
          }
     })
      
   }, 
 ],function(err,done) {
     console.log(done)
     if(err) {
       callback({ message: err, code: responseCode.badRequest }, null)
     }
     else {
       Request.where('id', 'IN', done).fetchAll({withRelated: ['carrier', 'sender', 'receiver', 'shipment', 'carrier_post' ]}).then ((requests) => {
        callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.reqCarrier, data: requests} })
       })
     }
   })
 })
}
  })
}
})
    })
}

function carrierStatus(req, callback) {
    Request.where({ sender_id: req.user.id, id: req.query.request_id }).fetchAll({ withRelated: ['receiver', 'carrier']}).then((carrier) => {
      if(carrier) {
            let jsonString = JSON.stringify(carrier);
            let finalValue = JSON.parse(jsonString);
            callback(null, { code: responseCode.ok, data:{ carrier: finalValue } })  
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

function carrierAccept(req,callback) {
  User.where({ id: req.user.id }).fetch().then ((users) => {  
    // console.log(req.user.id)      
    Request.where({ id: req.body.request_id , carrier_id: req.user.id }).fetch({ withRelated: ['sender', 'shipment','shipment.receiver_details'] }).then ((statusChecked) => {
      var jsonString = JSON.stringify(statusChecked);
      var status = JSON.parse(jsonString);
      if(statusChecked) {
        switch(req.body.flag) {
          case 1: {
            Request.query(function(qb) { 
              qb.where({ shipment_details_id: status.shipment_details_id })
               qb.orWhere({ carrier_details_id: status.carrier_details_id})
            }).where('status_id', '<>', 7)
               .save( { status_id: 9, label: responseMsg.messages.accept }, { patch: true }).then ((statusAccepted) => {
                Request.where({ id: req.body.request_id }).save({ status_id: 8, label: responseMsg.messages.receiverAccept }, { patch: true }).then((updateRequest) => {
                    console.log("Updated particular request");
                })
                let message = "User "+users.attributes.username+' '+responseMsg.messages.twilio.carReq+' '+req.body.request_id
              // Notification to sender
              console.log("Sender Id)")
              console.log(status.sender.id)
              notification.sendNotification({ message: message, to_user_id: [status.sender.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment.id, notification_type: 5, status_id: 8, role_id: 2 })
                            // console.log('Notifications saved');
              Shipment.where({ id: status.shipment_details_id }).fetchAll({ withRelated: ['receiver']}).then ((shipments) => {
                Shipment.where({ id: status.shipment_details_id }).save({ locked: 1}, { patch: true }).then ((locked) => {
                  Carrier.where({ id: status.carrier_details_id}).save({ locked: 1},{ patch: true }).then ((lockedCarrier) => {
                   console.log("Carrier notification");
                  })
                  
                })
            
              })
              async.waterfall([
                function(done){                          
                  if(status.receiver_id != 0) {
                    notification.sendNotification({ message: "User " +status.sender.username+' '+responseMsg.messages.twilio.receiverReq+' '+req.body.request_id, to_user_id: [status.receiver_id], user_id: status.sender.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, notification_type: 3, sender_id: status.sender_id, carrier_id: status.carrier_id,receiver_id: status.receiver_id, status_id: 8, role_id: 3 })
                    console.log("Notification send to receiver");
                  }
                  else {
                    console.log("New receiver")
                    console.log(status.shipment.receiver_details.country_code)
                    Twilio.sendSms(status.shipment.receiver_details.country_code+status.shipment.receiver_details.recipient_phone,"User "+status.sender.username+' '+responseMsg.messages.twilio.receiverReq+'.'+responseMsg.messages.twilio.ReceiverRequest+' '+"https://teams.microsoft.com/")
                }
                      done()
              }],function(err,done) {
                      callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.notification } })             
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
          statusChecked.save({ status_id: req.body.status_id, reason: req.body.reason, label: responseMsg.messages.rejectCarrier, comments: comments }, { patch: true }).then ((statusUpdated) => {
              let message = "User "+users.attributes.username+' '+responseMsg.messages.twilio.carRej+' '+req.body.request_id
              notification.sendNotification({ message: message, to_user_id: [status.sender.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment.id, sender_id: status.sender_id, carrier_id: status.carrier_id,  notification_type: 8, status_id: 7, role_id: 2 })
              console.log('Notifications saved');
              // Twilio.sendSms(status.sender.countrycode+status.sender.mobile, message)
              Notifications.forge({ message: "Reject Parcel for the deal number "+req.body.request_id , to_user_id: config.config.admin_id, user_id: req.user_id, notification_type: 16, request_id: req.body.request_id }).save()
              .then((notification) => {
                  console.log('Admin Notifications saved');
            }).catch(e => console.log(e))
              callback(null,{ data:{ message: responseMsg.messages.rejectReq },code: responseCode.ok  } ) 
            })  
        }break;
         
        case 3: {
          console.log("Modification of negotiable value");
          let negotiable_price = req.body.negotiable_price
            Shipment.where({ id: status.shipment.id }).save({ negotiable_price: negotiable_price }, { patch: true }).then ((statusUpdated) => {
              console.log(statusUpdated);
              Request.where({ id: req.body.request_id }).save({ status_id: 10, label: responseMsg.messages.senderAccept }, { patch: true }).then((updateRequest) => {
                console.log("Modified Price");
            })
              let message = "User"+' '+users.attributes.username+' '+responseMsg.messages.negPrice+' '+req.body.request_id
              notification.sendNotification({ message: message, to_user_id: [status.sender.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment.id,sender_id: status.sender_id, carrier_id: status.carrier_id, notification_type: 13, status_id: 10, role_id: 2 })
              console.log('Notifications saved');
              // Twilio.sendSms(status.sender.countrycode+status.sender.mobile, message)
              callback(null,  { data:{ message: 'Negotiable price send' } , code: responseCode.ok })
              })  
        }

        }
      }
      else {
        console.log(statusChecked)
        callback({ message: responseMsg.messages.acceptAlready , code: responseCode.badRequest }, null)
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))           
}

export default { carrierCreate, getCarrier, editCarrier, getSenderDetail, requestSender, getAllCarrier, carrierStatus, carrierAccept, pickupLocation };
