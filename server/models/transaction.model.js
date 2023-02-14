// Notification Model
const Schema = require('../../config/mysql.js'); 
const User = require('../models/user.model');
const Shipment = require('../models/shipment_details.model')
const Carrier = require('../models/carrier_details.model')
const Request = require('../models/request.model')
const Feedback = require('../models/feedback_reports.model')
const NotificationType = require('../models/notification_type.model')
const Package = require('../models/package_details.model')
const PackageDocument = require('../models/package_document_details.model');
const ContainerSize = require('../models/container_size_details.model');
const Weight = require('../models/weight_details.model');
const Receiver = require('../models/receiver_details.model');
const Rating = require('../models/ratings.model');


const Transaction =Schema.Bookshelf.Model.extend({
    tableName: 'transaction',
    hasTimestamps: true,
 
      shipment: function () {
        return (this.belongsTo('Shipment','shipment_details_id'))
      },
    
      carrier: function () {
        return this.belongsTo('Carrier','carrier_details_id');
      },
      
      request: function () {
        return this.belongsTo('Request','request_id');
      },

      sender: function () {
        return this.belongsTo('User','sender_id');
      },
    
      carrier: function () {
        return this.belongsTo('User','carrier_id');
      },

      receiver: function () {
        return this.belongsTo('User','receiver_id');
      },

      package: function () {
        return this.hasMany('Package','shipment_details_id');
      },
    
      package_doc: function () {
        return this.hasMany('PackageDocument','shipment_details_id');
      },
    
      container_size_details: function () {
        return this.hasMany(ContainerSize,'shipment_details_id');
      },
    
      receiver: function () {
        return this.belongsTo(Receiver,'shipment_details_id');
      }

})

module.exports = Schema.Bookshelf.model('Transaction', Transaction);