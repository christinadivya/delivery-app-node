const Schema = require('../../config/mysql.js'); 
const User = require('../models/user.model');
const Shipment = require('../models/shipment_details.model');
const Carrier = require('../models/carrier_details.model');
const Request = require('../models/request.model');

const Rating =Schema.Bookshelf.Model.extend({
    tableName: 'ratings',
    hasTimestamps: true,

      report_to: function () {
        return this.belongsTo('User','report_to');
      },

      request: function () {
        return this.belongsTo('Request','request_id');
      },

      shipment: function () {
        return this.belongsTo('Shipment','shipment_details_id');
      },
    
      carrier: function () {
        return this.belongsTo('Carrier','carrier_details_id');
      },
      
})

module.exports = Schema.Bookshelf.model('Rating', Rating);