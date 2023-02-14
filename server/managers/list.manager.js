import Weight from '../models/weight_details.model';
import Container from '../models/container_details.model';
import Status from '../models/status.model';
import Terms from '../models/terms.model';
import Roles from '../models/role.model';
import Feedback from '../models/feedbacks.model';
import Faq from '../models/faq.model';
import NotificationType from '../models/notification_type.model';
import Reject from '../models/reject_list.model';
import About from '../models/about_us.model';
import Country from '../models/country_codes.model';
import Content from '../models/directional_content.model';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import config from '../../../config/config';
const _ = require('lodash'); 

function weightDetails(req, callback) {
    Weight.forge()
    .fetchAll()
    .then((weight) => {
      callback(null, { data: weight, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

function containerDetails(req, callback) {
    Container.forge()
    .fetchAll()
    .then((container) => {
      callback(null, { data: container, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
  
function statusDetails(req, callback) {
    Status.forge()
    .fetchAll()
    .then((status) => {
      callback(null, { data: status, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

function termsCondition(req, callback) {
    Terms.forge()
    .fetchAll()
    .then((terms) => {
      callback(null, { data: terms, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }
   
function roles(req, callback) {
    Roles.forge()
    .fetchAll()
    .then((roles) => {
      callback(null, { data: roles, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

function feedbackList(req, callback) {
    Feedback.where({ role_id: req.query.role_id })
    .fetchAll()
    .then((feedbacks) => {
      callback(null, { data: feedbacks, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function rejectList(req, callback) {
  Reject.where({ role_id: req.query.role_id })
  .fetchAll()
  .then((rejectList) => {
    callback(null, { data: rejectList, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function rejectListALL(req, callback) {
  Reject.forge()
  .fetchAll()
  .then((rejectList) => {
    var jsonString = JSON.stringify(rejectList);
    var finalObject = JSON.parse(jsonString);
    var results = _(finalObject)
        .groupBy('reason')
        .map((v, data) => ({
        data,
        v: _.flatMap(v, (value)=> [value.id]),
      }))
        .value();
       
    callback(null, { data: results, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function faqList(req, callback) {
  Faq.forge()
  .fetchAll()
  .then((faqs) => {
    callback(null, { data: faqs, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function aboutUs(req, callback) {
  About.forge()
  .fetchAll()
  .then((about) => {
    callback(null, { data: about, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function notificationType(req, callback) {
  NotificationType.forge()
  .fetchAll()
  .then((type) => {
    callback(null, { data: type, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function countryCode(req, callback) {
  Country.forge().orderBy('country_name','ASC')
  .fetchAll()
  .then((country) => {
    console.log(country)
    callback(null, { data: country, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function DirectionalContent(req, callback) {
  Content.where({ role_id: req.query.role_id })
  .fetchAll()
  .then((contents) => {
    console.log(contents)
    callback(null, { data: contents, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}


  export default { weightDetails, containerDetails, statusDetails, termsCondition, roles, feedbackList, faqList, aboutUs, rejectList, countryCode, notificationType, DirectionalContent, rejectListALL };
  