import Schema from '../../../config/mysql.js';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import User from '../models/user.model';
import Shipment from '../models/shipment_details.model';
import Carrier from '../models/carrier_details.model';
import Role from '../models/role.model';
import Request from '../models/request.model';
import Location from '../models/location.model'
import Mailer from '../mail/mailer';
import pick from 'lodash.pick';
import moment from 'moment'
import async from 'async';
const _ = require('lodash'); 

function asSender(req, callback) {  
    let pageNo = req.query.page || 1
    let query;
    if(req.query.flag) {
        switch(req.query.flag) {
            case '1': { 
                query = function(qb) {
                    qb.orWhere((qb1) => {
                        qb1.orWhere({ sender_id: req.user.id, status_id: 3}),
                        qb1.orWhere({ sender_id: req.user.id, status_id: 8}),
                        qb1.orWhere({ sender_id: req.user.id, status_id: 10 })
                    })
                }
            }break;
            case '2': {
                query = {
                    where: { sender_id: req.user.id, status_id: 4 }, 
                }
            }break;
            case '3': {
                query = {
                    where: { sender_id: req.user.id, status_id: 5 }
                }
            }break;

            // default: { query = { where: { sender_id: req.user.id }} };
        }
    }
    else {
        query = { where: { sender_id: req.user.id } };
    }
    console.log(query.toString())
    Request.query(query).where('status_id', '<>', 7).where('status_id','<>', 9).orderBy('updated_at', 'DESC')
       .fetchPage({ page: pageNo, pageSize: 10,withRelated: ['shipment.weight_details','shipment','sender','carrier','receiver']})
       .then ((asSenders) =>{ 
        if(req.query.search) {
            // query = function(qb) { qb.where('id','LIKE', '%'+req.query.search+'%') } 
            query = function(qb) {
                qb.join('users', 'requests.receiver_id', 'users.id')
                qb.orWhere('users.username', 'LIKE', '%'+req.query.search+'%')
                qb.orWhere('users.name', 'LIKE', '%'+req.query.search+'%')
                qb.orWhere('requests.id','LIKE', '%'+req.query.search+'%')
            }
            Request.query(query).where('status_id', '<>', 7).where('status_id','<>', 9).orderBy('updated_at', 'DESC')
            .fetchPage({ page: pageNo, pageSize: 10,withRelated: ['shipment.weight_details','shipment','sender','carrier','receiver']})
            .then ((asRequests) => { 
                callback(null, { data : { data: asRequests, total_page: asRequests.pagination.pageCount }, code: responseCode.ok })   
            })  
        }
        else {
            callback(null, { data : { data: asSenders, total_page: asSenders.pagination.pageCount }, code: responseCode.ok })   

        } 
        
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
        
}

function asCarrier(req, callback) {  
    let pageNo = req.query.page || 1
    let query;
    if(req.query.flag) {
        switch(req.query.flag) {
            case '1': { 
                query = { where: { carrier_id: req.user.id, status_id: 8 },
                          orWhere: { carrier_id: req.user.id, status_id: 3},
                          orWhere: { carrier_id: req.user.id, status_id: 10} };
            }break;
            case '2': {
                query = {
                    where: { carrier_id: req.user.id, status_id: 4 }
                }
            }break;
            case '3': {
                query = {
                    where: { carrier_id: req.user.id, status_id: 5 }
                }
            }break;
        }
    }
    else {
        query = { where: { carrier_id: req.user.id } };
    }
    Request.query(query).where('status_id', '<>', 7).where('status_id','<>', 9).orderBy('updated_at', 'DESC').fetchPage({ page: pageNo, pageSize: 10,withRelated: ['shipment.weight_details','shipment','sender','carrier','receiver']})
    .then ((asCarriers) =>{
        if(req.query.search) {
            // query = function(qb) { qb.where('id','LIKE', '%'+req.query.search+'%') } 
            query = function(qb) {
                qb.join('users', 'requests.sender_id', 'users.id')
                qb.orWhere('users.username', 'LIKE', '%'+req.query.search+'%')
                qb.orWhere('users.name', 'LIKE', '%'+req.query.search+'%')
                qb.orWhere('requests.id','LIKE', '%'+req.query.search+'%')
            }
            Request.query(query).where('status_id', '<>', 7).where('status_id','<>', 9).orderBy('updated_at', 'DESC')
            .fetchPage({ page: pageNo, pageSize: 10,withRelated: ['shipment.weight_details','shipment','sender','carrier','receiver']})
            .then ((asRequests) => { 
                callback(null, { data : { data: asRequests, total_page: asRequests.pagination.pageCount }, code: responseCode.ok })   
            })  
        }
        else {
            callback(null, { data : { data: asCarriers, total_page: asCarriers.pagination.pageCount }, code: responseCode.ok })

        }    
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
        
}

function asReceiver(req, callback) {  
    let pageNo = req.query.page || 1
    let query;
    if(req.query.flag) {
        switch(req.query.flag) {
            // case '1': { 
            //     query = { where: { receiver_id: req.user.id, status_id: 2 },
            //               orWhere: { receiver_id: req.user.id, status_id: 3} };
            // }break;
            case '2': {
                query = {
                    where: { receiver_id: req.user.id, status_id: 4 }
                }
            }break;
            case '3': {
                query = {
                    where: { receiver_id: req.user.id, status_id: 5 }
                }
            }break;
        }
    }
    else {
        query = { where: { receiver_id: req.user.id } };
    }
    Request.query(query).where('status_id', '<>', 10).where('status_id', '<>', 7).where('status_id', '<>', 3).where('status_id','<>', 8).where('status_id','<>', 9).orderBy('updated_at', 'DESC').fetchPage({ page: pageNo, pageSize: 10,withRelated: ['shipment.weight_details','shipment','sender','carrier','receiver']})
    .then ((asReceiver) => {
        if(req.query.search) {
            // query = function(qb) { qb.where('id','LIKE', '%'+req.query.search+'%') } 
            query = function(qb) {
                qb.join('users', 'requests.sender_id', 'users.id')
                qb.orWhere('users.username', 'LIKE', '%'+req.query.search+'%')
                qb.orWhere('users.name', 'LIKE', '%'+req.query.search+'%')
                qb.orWhere('requests.id','LIKE', '%'+req.query.search+'%')
            }

            Request.query(query).where('status_id', '<>', 7).where('status_id','<>', 9).orderBy('updated_at', 'DESC')
            .fetchPage({ page: pageNo, pageSize: 10,withRelated: ['shipment.weight_details','shipment','sender','carrier','receiver']})
            .then ((asRequests) => { 

                callback(null, { data : { data: asRequests, total_page: asRequests.pagination.pageCount }, code: responseCode.ok })   
            })  
               
            }
            else {
                callback(null, { data : { data: asReceiver, total_page: asReceiver.pagination.pageCount }, code: responseCode.ok })
    
            }    
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
        
}

function senderRequest(req, callback) {  
    Request.where({carrier_id: req.user.id, role_id: 2 }).fetchAll({withRelated: ['sender','shipment','receiver']})
    .then ((senderRequests) =>{
            callback(null, { code: responseCode.ok, data: senderRequests
        })
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
        
}

function carrierRequest(req, callback) {  
    Request.where({sender_id: req.user.id, role_id: 4 }).fetchAll({withRelated: ['carrier','shipment','carrier_post','receiver']})
    .then ((carrierRequests) =>{
            callback(null, { code: responseCode.ok, data: carrierRequests
        })
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
}

function detailView(req, callback) {  

    console.log("$$$");
    console.log(req.query.request_id);
    Request.where({ id: req.query.request_id }).fetchAll({withRelated: ['carrier','sender','receiver','shipment','shipment.weight_details','shipment.package','shipment.package_doc', 'shipment.container_size_details', 'rating']})
    .then ((requests) =>{
        if(requests) {
            var jsonString = JSON.stringify(requests);
            var finalObject = JSON.parse(jsonString);
            // Location.where({ user_id: finalObject[0].carrier.id }).orderBy('created_at','desc').fetch().then((carrierLocation) => {
            //     console.log(carrierLocation);
                callback(null, { code: responseCode.ok, data: requests})
            // })
            }
        else
            callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
}

function filterSenderRequest(req, callback) {
  
    let pick_lat, pick_lon, drop_lat, drop_lon;
    let setQuery;
    Carrier.where({ id: req.query.carrier_post_id }).fetch().then((carrier) => {
       pick_lat = carrier.attributes.pick_up_lat;
       pick_lon = carrier.attributes.pick_up_lon;
       drop_lat = carrier.attributes.drop_off_lat;
       drop_lon = carrier.attributes.drop_off_lon;
    const pick_from_date = (req.query.pick_from_date == undefined) ? null : (`'`+req.query.pick_from_date+`'`);
    const pick_to_date = (req.query.pick_to_date == undefined) ? null : (`'`+req.query.pick_to_date+`'`);
    const drop_from_date = (req.query.drop_from_date == undefined) ? null : (`'`+req.query.drop_from_date+`'`);
    const drop_to_date = (req.query.drop_to_date == undefined) ? null : (`'`+req.query.drop_to_date+`'`) ;
    const pickup_distance = (req.query.pickup_distance == undefined) ? null : req.query.pickup_distance;
    const drop_distance = (req.query.drop_distance == undefined) ? null : req.query.drop_distance;
    const weight_min = (req.query.weight_min == undefined) ? null : req.query.weight_min;
    const weight_max = (req.query.weight_max == undefined) ? null : req.query.weight_max;
    const unit = (req.query.unit == undefined) ? null : req.query.unit;
    const price_min = (req.query.price_min == undefined) ? null : req.query.price_min;
    const price_max = (req.query.price_max == undefined) ? null : req.query.price_max;
    // pick_lat = (req.query.pick_lat == undefined) ? null : req.query.pick_lat;
    // pick_lon = (req.query.pick_lon == undefined) ? null : req.query.pick_lon;
    // const drop_lon = (req.query.drop_lon == undefined) ? null : req.query.drop_lon;
    // const drop_lat = (req.query.drop_lat == undefined) ? null : req.query.drop_lat;
    const user_name = (req.query.user_name == undefined) ? null : (`'`+req.query.user_name+`'`);
    const role_id = req.query.role_id;
    
    setQuery = `CALL search_sender(`+role_id+`,`+user_name+`,`+pick_lat+`,`+pick_lon+`,`+drop_lat+`,`+drop_lon+`,`+pick_from_date+`,`+pick_to_date+`,`+
                                    drop_from_date+`,`+drop_to_date+`,`+weight_min+`,`+weight_max+`,`+unit+`,`+price_min+`,`+price_max+`,`+pickup_distance+`,`+drop_distance+`)`;
    setQuery = setQuery.toString();     
    console.log(setQuery);
                           
    Schema.Bookshelf.knex.raw([setQuery]).then((response) => { 
      if(response){ 
       var jsonString = JSON.stringify(response[0][0]);
       var finalObject = JSON.parse(jsonString);
       callback(null, { code: responseCode.ok,  data: finalObject  })
      }
      else{
        callback({ message: e, code: responseCode.badRequest }, null)
        
      }
      })
    })
  }

  function invite(req,callback) {
    let exists = [];
    async.waterfall([
        function(done) {
         for( let i = 0; i < req.body.email.length; i++){
             User.where({ email: req.body.email[i] }).fetch().then((users) => {
                 if(users != null) {
                     // console.log("User already available");
                     exists.push(req.body.email[i]);
                 }
                 else {
                     let userInput = { email: req.body.email[i],
                         path: '/inviteMail.html',
                         templateName: 'inviteMail' }
                         Mailer.sendMail1(userInput, function (err, info){});
                 }
                 console.log("%%%###")
                 console.log(i);
             if(i == req.body.email.length -1)
                    done(null,exists);
                 // console.log(exists);
             })
             
         }
        }],function(err,done) {
         console.log(done);
         console.log("%%%")
         if(done.length > 0) {
             let result = { email: done };
             if(result.email != [])
               callback(null, { code: responseCode.created,  data:{ message: result } })   
         }
         else{
             callback(null, { code: responseCode.ok,  data:{ message: responseMsg.messages.inviteEmail } })   
         }
        }) 
 }

function contactUs(req,callback) {
    console.log(req)
    req.body.email = 'fetch39delivery@gmail.com'
    Mailer.sendMail(req.body,
            'userMail', function (error, info) {});
   callback(null, { code: responseCode.ok,  data:{ message: responseMsg.messages.userEmail } })

}



export default { asSender, asCarrier, asReceiver, senderRequest, carrierRequest, detailView, filterSenderRequest, invite, contactUs };