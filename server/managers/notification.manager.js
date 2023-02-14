import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Notifications from '../../server/models/notifications.model'
import Request from '../../server/models/request.model'
import notification from '../../config/gcm';
import async from 'async';
const moment = require('moment');
const _ = require('lodash'); 


function notifyStatus(req, callback) {  
    let pageNo = req.query.page || 1
    
    Notifications.where({ to_user_id: req.user.id }).orderBy('created_at','DESC').fetchPage({ page: pageNo, pageSize: 10
    ,withRelated: ['notification_type', 'from'], columns:['id','message','user_id','to_user_id','shipment_details_id','carrier_details_id','request_id','status','notification_type','status_id','role_id','created_at', 'updated_at']}).then((status) => {
        var jsonString = JSON.stringify(status);
        var finalObject = JSON.parse(jsonString);
        console.log(status.pagination);  
        callback(null,{ data : { data: finalObject, total_page: status.pagination.pageCount }, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}


function updateStatus(req, callback) {
    console.log(req.body.notification_id);
    console.log(req.user.id)  
    Notifications.where({ id: req.body.notification_id, to_user_id: req.user.id }).fetch({ withRelated: ['notification_type']}).then((status) => {
        if(status) {
            if(req.body.status == 'read') {
                status.save({ status : 'read'}, { patch: true }).then((updatedStatus) => {
                    callback(null,{ data: status, code: responseCode.ok });
                })
            }
            else {
                status.save({ status : 'unread'}, { patch: true }).then((updatedStatus) => {
                    callback(null,{ data: status, code: responseCode.ok });
                })
            }  
        }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function getDetail(req, callback) {
    console.log(req.query);
    // console.log(req.user.id)  
    Notifications.where({ id: req.query.notification_id, to_user_id: req.user.id })
    .fetch({ withRelated: ['shipment.package_doc','shipment.package','notification_type','from','to', 'shipment','sender_id', 'carrier_id', 'receiver_id','shipment.container_size_details','shipment.receiver','carrier','request', ]}).then((status) => {
        if(status){
               callback(null,{ data: status, code: responseCode.ok });
        }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function count(req,callback) {
    Notifications.where({ to_user_id: req.user.id, status: 'unread' }).count().then((notifications) => {
        console.log(notifications);
        callback(null,{ data: notifications, code: responseCode.ok });
    })

}

function lastestNotification(req,callback) {
    console.log(req);
    Notifications.where({ to_user_id: req.user.id, request_id: req.query.request_id }).
    orderBy('created_at', 'DESC').fetch({
        withRelated: ['shipment.package_doc','shipment.package','notification_type','from','to', 'shipment','sender_id', 'carrier_id', 'receiver_id','shipment.container_size_details','shipment.receiver','carrier','request']}).then((status) => {
            var jsonString = JSON.stringify(status);
            var finalObject = JSON.parse(jsonString);
            if(finalObject == null) {
                callback( { message: "Your invite is in Pending status", code: responseCode.badRequest },null);
            }
            else {
                callback(null,{ data : finalObject , code: responseCode.ok });
            }
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
    
}

function pickReminder(req,callback) {
    let message;
    Request.where({ status_id: 4}).fetchAll({ withRelated: ['sender','carrier','receiver','shipment']}).then((requests) => {
        let jsonString = JSON.stringify(requests);
        let details = JSON.parse(jsonString);
        details.forEach((value) => {
             let pick_up_date = moment.utc(value.shipment.pick_up_date).format('YYYY-MM-DD');
             let today_date = moment.utc(new Date()).format('YYYY-MM-DD');
             if(pick_up_date == today_date) {
                console.log("shipment available");
                async.waterfall([
                    function(done) {
                      // Carrier
                      message = 'Reminder for the shipment to be picked from the sender '+value.sender.username+' for the deal number '+value.id;
                      notification.sendNotification({ message: message, to_user_id: [value.carrier.id], user_id: [value.sender.id], request_id: [value.id], shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, notification_type: 12, status_id: 4, role_id: 4 })
                          done()
                    },
                    function(done) {
                        // Sender
                        message = 'Reminder for the shipment to be picked by the carrier '+value.carrier.username+' for the deal number '+value.id;
                         notification.sendNotification({ message: message, to_user_id: [value.sender.id], user_id: [value.carrier.id], request_id: [value.id], shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, notification_type: 12, status_id: 4, role_id: 2 })
                        done()
                      },
                    function(done) {
                        // Receiver
                        message = 'Reminder for the shipment to be picked from the sender '+value.sender.username+' carried by the carrier '+value.carrier.username+' for the deal number '+value.id;
                        notification.sendNotification({ message: message, to_user_id: [value.receiver.id], user_id: [value.sender.id], request_id: [value.id], shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, notification_type: 12, status_id: 4, role_id: 3 })
                        done()
                      }
                ], function(err,done) {
                        console.log("Pick up date Remaider");
                    })

             }
        })
    })
}

function dropReminder(req,callback) {
    let message;
    Request.where({ status_id: 4}).fetchAll({ withRelated: ['sender','carrier','receiver','shipment']}).then((requests) => {
        let jsonString = JSON.stringify(requests);
        let details = JSON.parse(jsonString);
        details.forEach((value) => {
             let drop_date = moment.utc(value.shipment.drop_off_date).format('YYYY-MM-DD');
             let today_date = moment.utc(new Date()).format('YYYY-MM-DD');
             if(drop_date == today_date) {
                console.log("shipment available");
                async.waterfall([
                    function(done) {
                      // Carrier
                          message = 'Reminder for the shipment to be dropped to the receiver '+value.receiver.username+' for the deal number '+value.id;
                          notification.sendNotification({ message: message, to_user_id: [value.carrier.id], user_id: [value.sender.id], request_id: [value.id], shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, notification_type: 12, status_id: 4, role_id: 4 })
                          done()
                    },
                    function(done) {
                        // Sender
                        message = 'Reminder for the shipment to be dropped by '+value.carrier.username+' for the deal number '+value.id;
                        notification.sendNotification({ message: message, to_user_id: [value.sender.id], user_id: [value.carrier.id], request_id: [value.id], shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, notification_type: 12, status_id: 4, role_id: 2 })
                        done()
                      },
                    function(done) {
                        // Receiver
                        message = 'Reminder for the shipment to be dropped from the carrier '+value.carrier.username+' for the deal number '+value.id;
                        notification.sendNotification({ message: message, to_user_id: [value.receiver.id], user_id: [value.sender.id], request_id: [value.id], shipment_details_id: value.shipment_details_id, sender_id: value.sender_id, carrier_id: value.carrier_id, receiver_id: value.receiver_id, notification_type: 12, status_id: 4, role_id: 3 })
                        done()
                      }
                ], function(err,done) {
                        console.log("Drop off date Remaider");
                    })
             }
        })
    })
}


export default { notifyStatus, updateStatus, getDetail, count, lastestNotification, pickReminder, dropReminder,  }