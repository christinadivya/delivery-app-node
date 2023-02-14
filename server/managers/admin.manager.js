import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Mailer from '../mail/mailer';
import generator from 'generate-password';
import Schema from '../../../config/mysql.js';
import User from '../models/user.model';
import Label from '../models/label.model'
import Report from '../models/feedback_reports.model';
import Receiver from '../models/receiver_details.model';
import Shipment from '../models/shipment_details.model';
import Request from '../models/request.model';
import UserVerifications from '../models/user_verification.model';
import Transaction from '../models/transaction.model';
import FeedbackReport from '../models/feedback_reports.model';
import Country from '../models/country_codes.model';
import Commission from '../models/commission.model';
import Notifications from '../models/notifications.model';
import ContainerSize from '../models/container_size_details.model'
import notification from '../../config/gcm';
import Twilio from '../../../config/twilio.js';
import async from 'async';
import moment from 'moment';
import pick from 'lodash.pick';


const _ = require('lodash'); 

//---------------------------------------------------------------------------------------------
//Manage users
function viewUsers(req, callback) {
  let query;
  let pageNo = req.query.page || 1;
  let size = req.query.size || 5;
    User.where( { id: req.user.id, role: 'admin', is_delete: 0 }).fetch().then((adminRole) => {
       if(adminRole) {
        query = function (qb) {

          if(!req.query.search && !req.query.sort_type && !req.query.sort && !req.query.flag && !req.query.verify) {
            qb.andWhere('is_delete', 0 )
            qb.where('role', 'user')
            qb.orderBy('updated_at', 'DESC')
          }
         
          if(req.query.search != null || req.query.search != undefined) {
            qb.andWhere((qb1)=>{
              qb1.where('is_delete', 0)
              qb1.where('role', 'user')
              qb1.andWhere((qb2)=> {
                qb2.orWhere('username','LIKE', '%'+req.query.search+'%')
                qb2.orWhere('name','LIKE', '%'+req.query.search+'%')
                qb2.orWhere('email', 'LIKE', '%'+req.query.search+'%')
                qb2.orWhere('mobile', 'LIKE', '%'+req.query.search+'%')
              })
             
            })
             
              
          } 
       if(req.query.sort !=null || req.query.sort != undefined && req.query.sort_type != null && req.query.sort_type != undefined) {
            if(req.query.sort_type == '1') {
              req.query.sort_type = 'DESC';
              qb.orderBy(req.query.sort,req.query.sort_type)
            }
            else if(req.query.sort_type == '2') {
              req.query.sort_type = 'ASC';
              qb.orderBy(req.query.sort,req.query.sort_type)
            }
          

          }
          if(req.query.flag != null || req.query.flag != undefined) {
            if(req.query.flag == 0) {
              qb.andWhere('block', 0 )
              qb.andWhere('is_delete', 0 )
              qb.where('role', 'user')
            }
            else if(req.query.flag == 1) {
              qb.andWhere('block', 1 )
              qb.andWhere('is_delete', 0 )
              qb.where('role', 'user')
            }
            if(req.query.flag == 2) {
              qb.andWhere('verify', 0 )
              qb.andWhere('is_delete', 0 )
              qb.andWhere('block', 0 )
              qb.where('role', 'user')
            }
            else if(req.query.flag == 3){
              qb.andWhere('verify', 1 )
              qb.andWhere('is_delete', 0 )
              qb.andWhere('block', 0 )
              qb.where('role', 'user')
            }
           
          }
          if(req.query.verify != null || req.query.verify != undefined) {
            if(req.query.verify == 0) {
              qb.andWhere('verify', 0 )
              qb.andWhere('is_delete', 0 )
              qb.andWhere('block', 0 )
              qb.where('role', 'user')
            }
            else if(req.query.verify == 1){
              qb.andWhere('verify', 1 )
              qb.andWhere('is_delete', 0 )
              qb.andWhere('block', 0 )
              qb.where('role', 'user')
            }
            
          }
        
        
        }

        console.log("%%%")
        console.log(query.toString())
        User.query(query)
        .fetchPage({ page: pageNo, pageSize: size })
        .then((user) => {
          let jsonString = JSON.stringify(user);
          let finalValue = JSON.parse(jsonString);
          // console.log(user);
          callback(null, { data: { data: finalValue, total_page: user.pagination.pageCount, total_count: user.pagination.rowCount }, code: responseCode.ok });
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
       }
       else {
        callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
 
       }
    })
   
  }


function createUsers(req, callback) {
    User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
       if(adminRole) {
        req.body.is_user_active = 1;
        User.forge(req.body).save()
        .then((user) => {
          callback(null, { data: user, code: responseCode.ok });
          Mailer.sendMail(req.body, 'userInvite', function (err, info){});
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
       }
       else {
        callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
       }
    })
   
  }

function activateUsers(req, callback) {
  let message;
    User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
       if(adminRole) {
        User.where({id: req.body.user_id }).fetch()
         .then((user) => {
          if(user) {
            if(req.body.block == 1) {
              message = "Your account has been blocked"
            }
            else {
              message = "Your account has been unblocked"
            }
            user.save( { block: req.body.block }, { patch: true }).then((updateUser) => {
              Mailer.sendMail({
                email: user.attributes.email,
                message: message}, 'activeUser', function (err, info){});
              callback(null, { data: updateUser, code: responseCode.ok });
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
          }
          else
            callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
       }
       else {
        callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
       }
    })
   
  }

function deleteUser(req, callback) {
    User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
      if(adminRole) {
      User.where({ id: req.body.user_id }).fetch().then((user) => {
        if(user) {
          user.save({ is_delete: 1 }, { patch: true }).then((deleteUser) => {
            callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.delete} })
          })
        }  
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    }
    else {
      callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

     }
    })
}

function editUser(req, callback) {
  User.where( { id: req.user.id, role: 'admin'}).fetch().then((adminRole) => {
    if(adminRole) {
      User.where({ id: req.body.id,  is_delete: 0  }).fetch().then((user) => {
        if(user) {
          console.log(req.body);
          if(req.body.govt_id_exp_date != null || req.body.govt_id_exp_date != undefined) {
            req.body.govt_id_exp_date = moment.utc(req.body.govt_id_exp_date).format('YYYY-MM-DD hh:mm:ss');
          }
          user.save(req.body, { patch: true }).then((updatedUser) => {
            User.where({ id: req.body.id }).fetch().then ((users) => {
              Mailer.sendMail({
                email: users.attributes.email}, 'edit', function (err, info){});
              callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.proUpdate, user: users } })
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
        }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

   }
  })
}

function getUser(req, callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      User.where({ id: req.query.user_id }).where('is_delete','<>', 1).fetch().then((user) => {
        if(user) 
          callback(null, { code: responseCode.ok, data: { user: user } })
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

   }
  })
}

function verifyUser(req, callback) {
  let message;
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      User.forge({ id: req.body.id }).fetch().then((user) => {
        if(user) {
          if(user.attributes.govt_id == '' || user.attributes.govt_id == null || user.attributes.govt_id_image_url_front == '' || user.attributes.govt_id_image_url_back == '' 
          || user.attributes.govt_id_image_url_front == null || user.attributes.govt_id_image_url_back == null || user.attributes.govt_id_exp_date == '' || user.attributes.govt_id_exp_date == null ) {
              callback({ message: responseMsg.messages.govtProof , code: responseCode.badRequest },null);
          }
          else {
            if(req.body.verify == 1) {
              user.save({ verify: req.body.verify }, { patch: true }).then((updatedUser) => {
                message = "Your Government ID has been verified successfully";
                Mailer.sendMail({
                  email: user.attributes.email,
                  message: message }, 'verify', function (err, info){});
                  callback(null, { code: responseCode.ok, data: { message: "Government Id verified", user: updatedUser } })
              })
            }
            else if(req.body.verify == 0){
              user.save({ verify: req.body.verify }, { patch: true }).then((updatedUser) => {
                message = "Your Government ID has been disapproved. Please update your Government Id Details";
                Mailer.sendMail({
                  email: user.attributes.email,
                  message: message }, 'verify', function (err, info){});
                  callback(null, { code: responseCode.ok, data: { message: "Government Id verified", user: updatedUser } })
              })
            }
          }
        }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
   }
  })
}
//------------------------------------------------------------------------------
// View Reports

function viewReport(req, callback) {
  let page = req.query.page || 1
  let size = req.query.size || 20
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      FeedbackReport.where({ review: 0 }).orderBy('created_at','DESC').fetchPage({ page: page, pageSize: size , withRelated: ['report_to', 'report_from', 'feedback'] }).then((report) => {
        if(report) 
          callback(null, { code: responseCode.ok, data: { report: report, total_page: report.pagination.pageCount, total_count: report.pagination.rowCount  } })
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

   }
  })
}


function reviewReport(req, callback) {

  let message;
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
     if(adminRole) {
      FeedbackReport.where({ id: req.body.report_id }).fetchAll({ withRelated: ['report_to', 'report_from', 'feedback'] })
       .then((reports) => {
        var jsonString = JSON.stringify(reports);
        var report = JSON.parse(jsonString);
        if(report) {
          FeedbackReport.where({ id: req.body.report_id }).save({ review: 1 }, { patch: true}).then((uodated) => {
          switch(req.body.flag) {
            case '1': 
            {
              message = "Your account has been blocked by fetch39 admin as per the report";
              User.where({ id: report[0].report_to.id }).save( { block: 1 }, { patch: true }).then((updateUser) => {
                Mailer.sendMail({
                  email: report[0].report_to.email,
                  message: message}, 'activeUser', function (err, info){});
                // Notification send to reporting user
                notification.sendNotification({ message: responseMsg.messages.review,
                  to_user_id: report[0].report_from.id, user_id: req.user.id , request_id : [], role_id: 1, notification_type: 11, comments: req.body.comments });
                // Notification send to reported user
                notification.sendNotification({ message: responseMsg.messages.review,
                   to_user_id: report[0].report_to.id, user_id: req.user.id , request_id : [], role_id: 1, notification_type: 11, comments: req.body.comments });
                }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
                break;
            } 
            case '2': {
              console.log("Cancel review");
              console.log(report)
              message = "We did not find any issues on "+ report[0].report_to.username;
              // User.where({ id: report.report_to.id }).save( { block: 1 }, { patch: true }).then((updateUser) => {
                Mailer.sendMail({
                  email: report[0].report_from.email,
                  message: message}, 'activeUser', function (err, info){});
                // Notification send to reporting user
                notification.sendNotification({ message: responseMsg.messages.cancelReview,
                  to_user_id: report[0].report_from.id, user_id: req.user.id , request_id : [], role_id: 1, notification_type: 11, comments: req.body.comments });
                // Notification send to reported user
                notification.sendNotification({ message: responseMsg.messages.cancelReview,
                   to_user_id: report[0].report_to.id, user_id: req.user.id , request_id : [], role_id: 1, notification_type: 11, comments: req.body.comments });
                // }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
            
                break;
            }
          }
          
            callback(null, { data: "Reviewed by admin and notification send accordingly", code: responseCode.ok });
           })
          }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
     }
     else {
      callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
     }
  })

}
//--------------------------------------------------------------------------------------------

//View Reject List
function viewReject(req, callback) {

  let query;
  let pageNo = req.query.page || 1;
  let size = req.query.size || 5;
  User.where({ id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      query = function (qb) {
        if(req.query.search != null || req.query.search != undefined) {
          var array = JSON.parse("[" + req.query.search + "]");
           
           qb.where('reason' , 'IN' , array)
         }
         if(req.query.search_param != null || req.query.search_param != undefined) {
          qb.where('id','LIKE',req.query.search_param)
         }
        
      } 
      // if(req.query.search == null || req.query.search == undefined) {
      //   query = {};
      // }
     
     console.log(query);
     Request.query(query).where({status_id: 7}).orderBy('created_at', 'Desc').fetchPage({ page: pageNo, pageSize: size , withRelated:['shipment', 'reason', 'sender'] }).then((requests) => {
      let jsonString = JSON.stringify(requests);
      let finalValue = JSON.parse(jsonString);
      // console.log(user);
      callback(null, { data: { data: finalValue, total_page: requests.pagination.pageCount, total_count: requests.pagination.rowCount }, code: responseCode.ok });
     })
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

   }
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

//------------------------------------------------------------------------------------------
//View Shipments

function viewShipment(req, callback) {

  let query;
  let pageNo = req.query.page || 1;
  let size = req.query.size || 5;
  console.log("**", typeof req.query.from_date)
  
  User.where({ id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      query = function (qb) {
        if(req.query.search != null || req.query.search != undefined) {
        qb.where({ label:req.query.search})
        }
        if(req.query.from_date == "NaN-NaN-NaN" || req.query.from_date == "NaN-NaN-NaN" ) {
          console.log("Error");
        }else {
        if(req.query.from_date != undefined || req.query.from_date!= null || re.query.from_date !='' ) { 
              let tomorrow=moment(todate).add(1, 'days') 
              let fromdate= new Date(req.query.from_date).toISOString() 
              let todate= new Date(req.query.to_date)  
             qb.join('shipment_details', 'requests.shipment_details_id', 'shipment_details.id')
             qb.whereBetween('shipment_details.pick_up_date', [fromdate, tomorrow.toISOString()]);
        }
      }

      }
      // if(req.query.search == null || req.query.search == undefined && req.query.from_date == undefined || req.query.from_date == null) {
      //   query = {} ;
      // }
     console.log(query);
     Request.query(query).where('status_id','<>',4).where('status_id','<>',9).orderBy('updated_at', 'DESC').
    fetchPage({ page: pageNo, pageSize: size , withRelated:[
      'shipment', 'sender'] }).then( function (requests) {

      let jsonString = JSON.stringify(requests);
      let finalValue = JSON.parse(jsonString);
      // console.log(user);
         callback(null, { data: { data: finalValue, total_page: requests.pagination.pageCount, total_count: requests.pagination.rowCount }, code: responseCode.ok });
     })
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

   }
 }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function label(req, callback) {
  Label.forge()
  .fetchAll()
  .then((label) => {
    callback(null, { data: label, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
 
}


function getShipment(req, callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      console.log(req.query.request_id);
      Request.where({ id: req.query.request_id }).fetchAll({withRelated: ['carrier','sender','receiver','shipment','shipment.weight_details','shipment.package','shipment.package_doc', 'shipment.container_size_details']})
      .then ((requests) =>{
          if(requests) {
              var jsonString = JSON.stringify(requests);
              var finalObject = JSON.parse(jsonString);
                  callback(null, { code: responseCode.ok, data: requests})
              }
          else
              callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	;
  }
  else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);

   }
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
 }
 
//-------------------------------------------------------------------------------------------

function createCommission(req, callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
      if(adminRole) {
        Commission.where( { country_id: req.body.country_id }).fetch({ withRelated: ['country']}).then((commission) => {
          if(commission) {
            console.log(commission)
            commission.save(req.body, { patch: true }).then((updatedCommission) => {
                callback(null, { code: responseCode.ok, data: { message: "Commission updated Successfully"} })
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      
          }
          else {
           Commission.forge(req.body).save()
           .then((commission) => {
              callback(null, {  data: { message: "Commission created Successfully", commission: commission }, code: responseCode.ok });
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
          }
        })
       }
       else {
        callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
       }
  })
}

function getCommission(req, callback) {
  
    User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
       if(adminRole) {
        Commission.forge().fetchAll({ withRelated : ['country']})
        .then((commission) => {
          callback(null, { data: { data: commission }, code: responseCode.ok });
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
       }
       else {
        callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
       }
    })
 
}

function editCommission(req, callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {
      Commission.where( { id: req.body.id }).fetch({ withRelated: ['country']}).then((commission) => {
        if(commission) {
          console.log(commission)
          commission.save(req.body, { patch: true }).then((updatedCommission) => {
            Commission.where({ id: req.body.id}).fetch({ withRelated: ['country']}).then ((updatedCommission) => {
              callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.proUpdate, commission: updatedCommission } })
            }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
    
        }

        else {
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
        }
      })
          }
    else {
     callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}
//-------------------------------------------------------------------------------------------
// Admin announcement
function announcement(req, callback) {
  User.where({ role: "user"}).fetchAll().then((users) => {
    if(users) {
      let to_user_id = []
      let jsonString = JSON.stringify(users);
      let finalValue = JSON.parse(jsonString);
      // console.log(finalValue);
      async.waterfall([
        function(done){
          finalValue.forEach(element => {
              to_user_id.push(element.id);
              if(to_user_id.length == finalValue.length)
              // if(finalValue.length == users.length)
                 done(null, to_user_id);
      });
    }, function(to_user_id,done) {
         if(to_user_id) {
          console.log(to_user_id)
          notification.generalNotification({ message: responseMsg.messages.general,
            to_user_id: to_user_id, user_id: req.user.id, request_id : [], role_id: 1, notification_type: 11, comments: req.body.message });
         }
           done()
       },],
       function(err,done) {
        if(err)
            callback({ message: err, code: responseCode.badRequest }, null)
        else
            callback(null,{ data: { message: responseMsg.messages.announce } , code: responseCode.ok });
       })
    }
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function notifyStatus(req, callback) {      
  //  let pageNo = req.query.page || 1;
  //  let limit = req.query.limit || 5;

    Notifications.where({ to_user_id: req.user.id }).orderBy('created_at','DESC').fetchAll({ withRelated: ['notification_type', 'from', 'request', 'feedback_report'], columns:['id','message','user_id','to_user_id','shipment_details_id','carrier_details_id','request_id','status','notification_type','status_id','feedback_id','role_id','created_at', 'updated_at']}).then((status) => {
        var jsonString = JSON.stringify(status);
        var finalObject = JSON.parse(jsonString);
        callback(null,{ data : { data: finalObject }, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}


// function getDetail(req, callback) {
//   console.log(req.query);
//   // console.log(req.user.id)  
//   Notifications.where({ id: req.query.notification_id, to_user_id: req.user.id })
//   .fetch({ withRelated: ['shipment.package_doc','shipment.package','notification_type','from','to', 'shipment','sender_id', 'carrier_id', 'receiver_id','shipment.container_size_details','shipment.receiver','carrier','request','feedback_report' ]}).then((status) => {
//       if(status){
//              callback(null,{ data: status, code: responseCode.ok });
//       }
//       else
//         callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
//   }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
// }

function changePassword(req,callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((user) => {
    if(user) {
      User.comparePassword(req.body.old_password, user, (err, valid) => {
        if (err) {
          callback(null,{ code: responseCode.ok, data: { message: "Old password is wrong" }});
        }
        if (!valid) {
          callback(null,{ code: responseCode.ok, data: { message: "Old password is wrong" }});
        } else {
         
        user.save(req.body).then ((updatePassword) => {
          if(!updatePassword)
            callback({ message: responseMsg.messages.norows, code: responseCode.badRequest },null)
          else
           callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.passUpdated }});
        }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
      }
    })
    }
    else {
     callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
    }
      }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));

}

function count(req,callback) {
  Notifications.where({ to_user_id: req.user.id, status: 'unread' }).count().then((notifications) => {
      console.log(notifications);
      callback(null,{ data: notifications, code: responseCode.ok });
  })

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

function getProfile(req, callback) {
  User.where( { id: req.user.id, role: "admin"}).fetch().then((users) => {
    callback(null,{ data: users, code: responseCode.ok })
  })
}

function editProfile(req,callback) {
  let params = pick(req.body,['name', 'profile_image_url']);
  User.where({ id: req.user.id}).fetch().then((users) => {
    users.save(params, {patch: true }).then((updated) =>{
      callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.proUpdate, user: updated } })
    })
  })
}

// Manage Transaction
  
function getTransaction(req,callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {

      let pageNo = req.query.page || 1;
      let size = req.query.size || 5;
      
      let query = function (qb) {
      qb.join('requests', 'transaction.request_id', 'requests.id')
      qb.orWhere('requests.status_id', '=', 4)
      qb.orWhere('requests.status_id', '=', 5);
      }
  Transaction.query(query).orderBy('updated_at', 'DESC').
  fetchPage({ page: pageNo, pageSize: size , withRelated:[
    'request','shipment', 'shipment.package_doc','shipment.package', 'shipment.container_size_details','shipment.receiver','sender', 'carrier', 'receiver'] }).then( function (transactions) {

    let jsonString = JSON.stringify(transactions);
    let finalValue = JSON.parse(jsonString);
    // console.log(user);
       callback(null, { data: { data: finalValue, total_page: transactions.pagination.pageCount, total_count: transactions.pagination.rowCount }, code: responseCode.ok });
   })
  } else {
   callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
  }
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function editTransaction(req,callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
    if(adminRole) {

      let pageNo = req.query.page || 1;
      let size = req.query.size || 5;
      
  Transaction.where({id: req.body.transaction_id}).fetch().then((transactions) => {
    if(transactions) {
      transactions.save({ commission_status: req.body.flag}, {patch: true }).then((upadtedTransaction) => {
        callback(null, { data: { message: "Transaction Updated successfully"}, code: responseCode.ok });
      })
    }
    else {
      callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
    }
  })
    
  
  } else {
   callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
  }
}).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function containerDetails(req, callback) {
  ContainerSize.where({ shipment_details_id: req.query.shipment_details_id }).fetchAll({ withRelated: ['container_details']}).then((sizes) => {
    callback(null,{ data: sizes, code: responseCode.ok })
  })
}

export default { viewUsers, createUsers, activateUsers, getUser, deleteUser, editUser, verifyUser, viewReport, reviewReport, viewShipment,  label, getShipment, createCommission, getCommission, editCommission, announcement, viewReject, notifyStatus, changePassword, count, updateStatus,
  getProfile, editProfile, getTransaction, editTransaction, containerDetails}