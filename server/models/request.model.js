import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Shipment from '../models/shipment_details.model';
import Carrier from '../models/carrier_details.model';
import Receiver from '../models/receiver_details.model';
import Package from '../models/package_details.model';
import PackageDocument from '../models/package_document_details.model';
import ContainerSize from '../models/container_size_details.model';
import Status from '../models/status.model';
import Weight from '../models/weight_details.model';
import RejectList from '../models/receiver_details.model';
import Rated from '../models/rated.model';

const Request = Schema.Bookshelf.Model.extend({

  tableName: 'requests',
  hasTimestamps: true,

  rating: function () {
    return this.hasMany('Rated', 'request_id');
  },

  sender: function () {
    return this.belongsTo('User', 'sender_id');
  },
  
  carrier: function () {
    return this.belongsTo('User', 'carrier_id');
  },

  receiver: function () {
    return this.belongsTo('User', 'receiver_id');
  },


  shipment: function () {
    return this.belongsTo('Shipment','shipment_details_id');
  },

  carrier_post: function () {
    return this.belongsTo('Carrier','carrier_details_id');
  },

  status: function () {
    return this.belongsTo(Status);
  },

  reason: function () {
    return this.belongsTo('Reject','reason');
  },

  notification_type: function () {
    return this.belongsTo('NotificationType','notification_type');
  },

  weight_details: function () {
    return this.belongsTo('Weight', 'weight_details_id');
  },

  package: function () {
    return this.hasMany('Package','shipment_details_id');
  },

  package_doc: function () {
    return this.hasMany('PackageDocument','shipment_details_id');
  },

  container_size_details: function () {
    return this.hasMany('ContainerSize','shipment_details_id');
  },

  receiver_details: function () {
    return this.belongsTo('Receiver','shipment_details_id');
  },


});

module.exports = Schema.Bookshelf.model('Request', Request);