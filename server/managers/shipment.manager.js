import Schema from '../../../config/mysql.js';
import User from '../models/user.model';
import Shipment from '../models/shipment_details.model';
import Carrier from '../models/carrier_details.model';
import Package from '../models/package_details.model';
import Notifications from '../models/notifications.model'
import UserVerifications from '../models/user_verification.model';
import PackageDocument from '../models/package_document_details.model';
import ContainerSize from '../models/container_size_details.model';
import Receiver from '../models/receiver_details.model';
import Request from '../models/request.model';
import Twilio from '../../../config/twilio.js';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Paypal from '../../../config/paypal.js'
import config from '../../../config/config';
import Mailer from '../mail/mailer';
import Country from '../models/country_codes.model';
import Commission from '../models/commission.model';
import notification from '../../config/gcm';
import pick from 'lodash.pick';
import moment from 'moment';
import async from 'async';
import NodeGeocoder from 'node-geocoder';
const _ = require('lodash'); 
var geocoder = NodeGeocoder(config.config.options);


function senderShipment(req, callback) {
  let admin_amount, carrier_amount;
  req.body.user_id = req.user.id
  console.log(req)
  User.where({ id: req.user.id }).fetch().then ((users) => {
  if(users.attributes.govt_id == '' || users.attributes.govt_id == null || users.attributes.govt_id_image_url_front == '' || users.attributes.govt_id_image_url_back == '' 
            || users.attributes.govt_id_image_url_front == null || users.attributes.govt_id_image_url_back == null || users.attributes.govt_id_exp_date == '' || users.attributes.govt_id_exp_date == null ) {
                callback({ message: responseMsg.messages.govtVer, code: responseCode.unauthorised }, null);
      }     
  else {
    req.body.pick_up_date = moment.utc(req.body.pick_up_date).format('YYYY-MM-DD hh:mm:ss');      
    req.body.drop_off_date = moment.utc(req.body.drop_off_date).format('YYYY-MM-DD hh:mm:ss');

    let shipment_params = pick(req.body, ['user_id', 'shipment_name', 'shipment_original_value', 'shipment_value', 'pick_up_location','drop_off_location','pick_up_date','pick_up_time','total_pieces','total_weight', 'total_container', 'drop_off_date',  'extra_charge', 'negotiable', 'any_time',
       'pick_up_lat', 'pick_up_lon', 'drop_off_lat', 'drop_off_lon', 'weight_details_id', 'total_package'])
    Shipment.forge(shipment_params)
      .save()
      .then((shipment) => {
          if(shipment) {
              async.waterfall([
                function(done){
                  User.where({ mobile: req.body.recipient_phone.toString() }).fetch().then ((receiver) => {
                    if(receiver) {
                      console.log(receiver.attributes.id)
                      Shipment.where({ id: shipment.attributes.id }).save({ receiver_id: receiver.attributes.id }, {patch: true}).then((receiverUpdated) => {
                        console.log("Receiver Updated")
                      })
                    }
                  })
                  done()
                },
                  function(done){
                    for(var i = 0; i < req.body.package.length; i++) {
                        Package.forge({
                             shipment_details_id : shipment.attributes.id,
                             user_id: req.user.id,
                             package_image_url: req.body.package[i].image_url,
                             package_image_name:  req.body.package[i].image_name,
                             dimension:  req.body.package[i].dimension
                      }).save().then((packages) => {
                          console.log("Package inserted")
              })
          }
          done()
      },function(done){
          if(req.body.container_details_id) {
            req.body.container_details_id.forEach(function(value){
              ContainerSize.forge({
                   shipment_details_id : shipment.attributes.id,
                   user_id: req.user.id,
                   container_details_id: value
            }).save().then((size) => {
                console.log("Container Size inserted")
    })
  })
}
  done()
  },
  function(done){
   
    Receiver.forge({
      shipment_details_id : shipment.attributes.id,
      user_id: req.user.id,
      recipient_name: req.body.recipient_name,
      recipient_phone: req.body.recipient_phone,
      country_code: req.body.country_code,
      country_name: req.body.country_name
  
  }).save().then((receiver) => {
   console.log("Recipient name inserted")
  })
  
  done()
  },
  function(done) {
          if(req.body.files && req.body.files.length >= 1) {
              for(var i = 0; i < req.body.files.length; i++) {
                  PackageDocument.forge(
                              {
                               shipment_details_id : shipment.attributes.id,
                               user_id: req.user.id,
                               file_url: req.body.files[i].file_url,
                               file_name: req.body.files[i].file_name,
                               file_type: req.body.files[i].file_type,
                               file_dimension: req.body.files[i].file_dimension
                              }
                          ).save().then((packagedoc) => {
                          console.log("Package Document inserted")
                       })
                  }
              }  
            done()   
          },
          function(done) {
            geocoder.reverse({lat: shipment.attributes.pick_up_lat, lon: shipment.attributes.pick_up_lon}, function(err, res) {
              console.log(res);
              Country.where( {country_name: res[0].country }).fetch().then((countryId) => {
                   if(countryId) {
                      Commission.where( { country_id: countryId.attributes.id }).fetch().then((commission) => {
                        if(commission) {
                            admin_amount = (shipment.attributes.shipment_value * commission.attributes.commission)/100;
                            carrier_amount =  shipment.attributes.shipment_value - admin_amount;
                            Shipment.where({ id: shipment.attributes.id }).save( {
                              admin_amount: admin_amount,
                              carrier_amount: carrier_amount
                            }, { patch: true }).then((updated) => {
                                console.log("Updated Admin commission Amount");
                            })
                        }
                        else {
                          admin_amount = (shipment.attributes.shipment_value * config.config.commission)/100;
                          carrier_amount =  shipment.attributes.shipment_value - admin_amount;
                          Shipment.where({ id: shipment.attributes.id }).save( {
                            admin_amount: admin_amount,
                            carrier_amount: carrier_amount
                          }, { patch: true }).then((updated) => {
                              console.log("Updated Amount");
                          })
                        }
                      })
                   }
              })

            });
            done()
          }
      ],function(err,done) {
        if(err) {
          callback({ message: err, code: responseCode.badRequest }, null)
        }
          Shipment.where({id: shipment.attributes.id }).fetchAll({ withRelated: ['user', 'package', 'package_doc', 'container_size_details', 'weight_details', 'receiver']})
            .then((shipmentCreated) => {
              // Notifications.forge({message: responseMsg.messages.createShipment, to_user_id: config.config.admin_id, user_id: shipment.attributes.user_id,  shipment_details_id: shipment.attributes.id, notification_type: 11 }).save()
              //         .then ((notifications) => {
              //             console.log("Notification send to admin");
              //         })
              // payment to Admin
              // Paypal.createPayment(req.body, function(data){
              //   console.log(data)
              //   if(data.success){
              //     console.log(data.success)
                  callback(null, { data: { sender: shipmentCreated, role: req.body.role_id }, code: responseCode.ok });
              //   }else{
              //     callback({ message: data.error, code: responseCode.badRequest }, null)
              //   }
              // });
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
        });
  
       }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
     }
   })
 
}

function getShipment(req, callback) {

 Shipment.where({ id: req.query.shipment_id })
  .fetch({ withRelated: ['user', 'package', 'package_doc', 'container_size_details', 'weight_details', 'receiver', 'receiver_details']})
  .then((shipment) => {
    callback(null, { data: shipment, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));

}

function getAllShipment(req, callback) {
  Shipment.where({ user_id: req.user.id })
   .fetchAll({ withRelated: ['user', 'package', 'package_doc', 'container_size_details', 'weight_details', 'receiver', 'receiver_details']})
   .then((shipment) => {
     callback(null, { data: shipment, code: responseCode.ok });
   }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
 
 }


function editShipment(req, callback) {
    let shipment_params = pick(req.body, ['user_id', 'shipment_name', 'shipment_value', 'pick_up_location','drop_off_location','pick_up_date','pick_up_time','total_pieces','total_weight', 'total_container', 'drop_off_date', 'drop_off_time', 'deal', 'extra_charge', 'negotiable', 'any_time',
    'pick_up_lat', 'pick_up_lon', 'drop_off_lat', 'drop_off_lon', 'weight_details_id'])
    console.log(shipment_params)
    Shipment.where({ user_id: req.user.id, id: req.body.shipment_id }).fetch({ withRelated: ['user', 'package', 'package_doc', 'weight_details', 'receiver']}).then((shipment) => {
      if(shipment) {
        shipment.save(shipment_params, { patch: true }).then((updatedUser) => {
            async.waterfall([
              function(done){
                if(req.body.recipient_name || req.body.recipient_phone) {
                  Receiver.where({
                    shipment_details_id : shipment.attributes.id,
                    user_id: req.user.id,   
             }).save({ recipient_name: req.body.recipient_name, recipient_phone: req.body.recipient_phone }, { patch: true}).then((receiver) => {
                 console.log("Recipient Name Updated")
           })
  }
  done()

},
function(done){
  if(req.body.drop_off_location) {
    Receiver.where({
      shipment_details_id : shipment.attributes.id,
      user_id: req.user.id,   
}).save({ drop_off_location: req.body.drop_off_location, drop_off_lat: req.body.drop_off_lat, drop_off_lon: req.body.drop_off_lon }, { patch: true}).then((receiver) => {
   console.log("Recipient location Updated")
})
}
done()

}],function(err,done) {
    if(err) {
      callback({ message: err, code: responseCode.badRequest }, null)
    }
    else {
      Shipment.where({ user_id: req.user.id, id: shipment_id }).fetch({ withRelated: ['user', 'package', 'package_doc', 'container_size_details', 'weight_details', 'receiver']}).then ((shipments) => {
        callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.shipUpdate, data: shipments } })
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }
  }
)
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
        
 }
      else {
        callback({ message: responseMsg.messages.norows , code: responseCode.badRequest }, null);
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }


function updatePackage(req, callback) {
    let shipment_detail_id = req.body.shipment_detail_id;
    Package.where({ id: req.body.id, user_id: req.user.id, shipment_details_id: shipment_detail_id }).save(req.body,{ patch: true }).then((updatePackage) => {
      if(updatePackage) {
          Package.where({ id: req.body.id,user_id: req.user.id, shipment_details_id: shipment_detail_id }).fetch().then ((packages) => {
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.packUpdate, data: packages } })
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function addPackage(req, callback) {
  async.waterfall([
    function(done){
      for(var i = 0; i < req.body.package.length; i++) {
        Package.forge({
             shipment_details_id : req.body.shipment_id,
             user_id: req.user.id,
             package_image_url: req.body.package[i].image_url,
             package_image_name:  req.body.package[i].image_name,
             dimension:  req.body.package[i].dimension
      }).save().then((packages) => {
          console.log("Package inserted")
})
}
  done()   
  }
  ],function(err,done) {
      Package.where({ shipment_details_id: req.body.shipment_id, user_id: req.user.id }).fetchAll().then ((packages) => {
        callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.packAdd, data: packages } })

      })
  })
}

function deletePackage(req, callback) {
    Package.where({ id: req.body.package_id, user_id: req.user.id, shipment_details_id: req.body.shipment_id }).destroy().then((packages) => {
        if(packages) {
          callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.packDelete} })
        }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function pickupLocation(req, callback) {
  
  let pick_lat,pick_lon,drop_lat,drop_lon,pick_up_date;

  Shipment.where( { id: req.query.shipment_id, user_id: req.user.id }).fetchAll({ withRelated: ['user'] }).then((shipments) => {
    if(shipments != null || shipments != undefined) {
        // console.log(shipments)
        let jsonString = JSON.stringify(shipments);
        let finalValue = JSON.parse(jsonString);
        console.log(finalValue[0])
    if(finalValue[0] != null || finalValue[0] != undefined) {
        pick_lat = finalValue[0].pick_up_lat;
        pick_lon = finalValue[0].pick_up_lon;
        drop_lat = finalValue[0].drop_off_lat;
        drop_lon = finalValue[0].drop_off_lon;
        pick_up_date = moment(finalValue[0].pick_up_date).format('YYYY-MM-DD');
        let setQuery = `CALL nearby_carrier(`+pick_lat+`,`+pick_lon+`,`+drop_lat+`,`+drop_lon+`,`+`'`+pick_up_date+`'`+`)`;
        setQuery = setQuery.toString();
        console.log(setQuery)
        Schema.Bookshelf.knex.raw([setQuery]).then((response) => { 
          if(response) { 
           var jsonString = JSON.stringify(response[0][0]);
           var finalObject = JSON.parse(jsonString);
           console.log(response[0][0])
           console.log(finalObject)
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
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));

}

function requestCarrier(req, callback) { 
  let user_ids = [];
  let name,receiver_id;
  req.body.carrier_id.forEach((value) => {
    Request.where({ sender_id: req.user.id, carrier_details_id: value, shipment_details_id: req.body.shipment_id }).fetch().then((requests) => {
      console.log(requests)
      if(requests) {
       callback({ message: "Invite sent already", code: responseCode.badRequest }, null)

      }
      else {
  Request.where({ shipment_details_id: req.body.shipment_id, status_id: 2 }).fetch().then ((statusChecked) =>{
   if(statusChecked) {
      callback({ message: responseMsg.messages.noSender , code: responseCode.badRequest }, null)
  }
   else {
    User.where({ id: req.user.id }).fetch().then ((users) => {
     name = users.attributes.username;
    //  console.log(req.user.id)
    Shipment.where({ id: req.body.shipment_id }).fetch().then ((shipments) => {
      receiver_id = shipments.attributes.receiver_id
    })
     async.waterfall([
      function(done){
        var id = [];
        req.body.carrier_id.forEach(function(value){
          Carrier.where({ id: value }).fetch({ withRelated: ['user']}).then ((users) => {
            var jsonString = JSON.stringify(users);
            var finalObject = JSON.parse(jsonString);
            console.log(finalObject)
              Request.forge({
                sender_id: req.user.id,
                carrier_id: users.attributes.user_id,
                receiver_id: receiver_id,
                carrier_details_id: value,
                shipment_details_id: req.body.shipment_id,
                status_id: req.body.status_id,
                role_id: req.body.role_id,
                label: responseMsg.messages.carAccept
              }).save().then ((request) => {
                console.log("Carrier request saved");
                id.push({
                  request_id: request.id,
                  to_user_id: users.attributes.user_id,
                  carrier_details_id: value,
                  message: "User "+name+' '+responseMsg.messages.twilio.senderReq+' '+request.id,
                  mobile: finalObject.user.mobile,
                  countrycode: finalObject.user.countrycode
                })
                if(id.length == req.body.carrier_id.length) {
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
                // Twilio.sendSms(value.countrycode+value.mobile, value.message)
                to_user_id.push(value.to_user_id);
                request_id.push(value.request_id);
                message = value.message;
                if(id.length == request_id.length) {
                  console.log('Notifications saved');
                  notification.sendNotification({ message: message,
                    to_user_id: to_user_id, user_id: req.user.id, shipment_details_id: req.body.shipment_id, carrier_details_id: value.carrier_details_id, request_id: request_id, notification_type: 1, status_id: 3 }) 
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
       Request.where('id', 'IN', done).fetchAll({withRelated: ['shipment']}).then ((requests) => {
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


function senderAccept(req,callback) {
 User.where({ id: req.user.id }).fetch().then ((users) => {  
  console.log("55tyh")      
  Request.where({ id: req.body.request_id, sender_id: req.user.id }).fetch({ withRelated: ['sender', 'carrier', 'receiver', 'shipment', 'shipment.receiver_details'] }).then ((statusChecked) => {
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
              Request.where({ id: req.body.request_id }).save({ status_id: 8, label: responseMsg.messages.receiverAccept }, {patch: true }).then((updateRequest) => {
                console.log("Updated Particular request");
              }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))
              let message = "User "+users.attributes.username+' '+responseMsg.messages.twilio.senReq+' '+req.body.request_id
            // Notification to carrier
                notification.sendNotification({ message: message, to_user_id: [status.carrier.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id,notification_type: 4, status_id: 8, role_id: 4 })
                    console.log(status.receiver_id)
                    console.log('Notifications saved');
                Shipment.where({ id: status.shipment_details_id }).fetch({ withRelated: ['receiver']}).then ((shipments) => {
                      shipments.save({ locked: 1}, { patch: true }).then ((locked) => {
                Carrier.where({ id: status.carrier_details_id}).save({ locked: 1},{ patch: true }).then ((lockedCarrier) => {
                          })
                        })
                      })
                async.waterfall([
                    function(done){                          
                        if(status.receiver_id != 0) {
                          console.log("Old receiver");
                            notification.sendNotification({message: "User "+status.sender.username+' '+responseMsg.messages.twilio.receiverReq+' '+req.body.request_id, to_user_id: [status.receiver_id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, notification_type: 3, sender_id: status.sender_id, carrier_id: status.carrier_id, receiver_id: status.receiver_id, status_id: 8, role_id: 3 })
                        // console.log("Notification send to receiver");
                         }
                        else {
                            console.log("New receiver @@@@");
                            console.log(status.shipment);
                            Twilio.sendSms(status.shipment.receiver_details.country_code+status.shipment.receiver_details.recipient_phone,"User "+users.attributes.username+' '+responseMsg.messages.twilio.receiverReq+'.'+responseMsg.messages.twilio.ReceiverRequest+' '+"https://play.google.com/store/apps/details?id=com.fetch39.delivery")
                          }
                          done()
                        } ], function(err,done) {
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
          if(status.shipment.negotiable == 1) {
            Shipment.where({ id: status.shipment_details_id }).save({ negotiable_price: null }, { patch: true }).then((updated) =>{
              console.log("negotiable price updated");
            })
          }
          statusChecked.save({status_id: req.body.status_id, reason: req.body.reason, label: responseMsg.messages.rejectSender, comments: comments }).then ((statusUpdated) => {
            let message = "User"+' '+users.attributes.username+' '+responseMsg.messages.twilio.senRej+' '+req.body.request_id
            notification.sendNotification({ message: message, to_user_id: [status.carrier.id], user_id: req.user.id, request_id: [req.body.request_id], shipment_details_id: status.shipment_details_id, sender_id: status.sender_id, carrier_id: status.carrier_id, notification_type: 7, status_id: 7, role_id: 4 })
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
      callback({ message: responseMsg.messages.carrierAlready , code: responseCode.badRequest }, null)
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null))            
}


export default { senderShipment, getShipment, getAllShipment, editShipment, updatePackage, addPackage, deletePackage, pickupLocation,
   requestCarrier,  senderAccept };
