import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Mailer from '../mail/mailer';
import generator from 'generate-password';
import Schema from '../../../config/mysql.js';
import User from '../models/user.model';
import Report from '../models/feedback_reports.model';
import Receiver from '../models/receiver_details.model';
import Shipment from '../models/shipment_details.model';
import Content from '../models/directional_content.model';

function create(req, callback) {
    User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
        if(adminRole) {
         Content.forge(req.body).save().then((contents) => {
            callback(null, { data: contents, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)) 
 }
else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
   }
    }) 
  }

function get(req, callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
        if(adminRole) {
    let query = {};
    if(req.query.role_id)
        query = { role_id: req.query.role_id };
    Content.where(query)
    .fetchAll()
    .then((contents) => {
      console.log(contents)
      callback(null, { data: contents, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
else {
    callback( { message: responseMsg.messages.noPermission, code: responseCode.badRequest },null);
   }
  })
}

function edit(req, callback) {
  User.where( { id: req.user.id, role: 'admin' }).fetch().then((adminRole) => {
        if(adminRole) {
    Content.where({ id: req.body.content_id }).fetch().then((contents) => {
      if(contents) {
        contents.save( { directional_content: req.body.directional_content }, { patch: true})
        .then((contents) => {
          console.log(contents);
          callback(null, { data: contents, code: responseCode.ok });

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

function deleteContent(req, callback) {
  Content.where({ id: req.body.content_id }).destroy().then((deleted) => {
      if(deleted) {
        callback(null, { code: responseCode.ok, data: { message: responseMsg.messages.deleteContent} })
      }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}
  
export default { create, get, edit, deleteContent }
