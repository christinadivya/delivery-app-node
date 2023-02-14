import Location from '../models/location.model';
import Request from '../models/request.model'
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import config from '../../../config/config';

function location(req, callback) {
    req.body.user_id = req.user.id;
    Location.forge(req.body)
    .save()
    .then((locations) => {
      callback(null, { data: locations, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  }

function getLocation(req, callback) {
  Request.where({ id: req.query.request_id }).fetchAll({ withRelated: ['shipment','carrier', 'sender', 'receiver']}).then(( requests) => {
    var jsonString = JSON.stringify(requests);
    var details = JSON.parse(jsonString);
    console.log(details)
    Location.where({ user_id: details[0].carrier.id }).orderBy('created_At','DESC')
    .fetch()
    .then((locations) => {
      callback(null, { data: { location: locations, data: details } , code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
  })
  }

export default { location, getLocation}