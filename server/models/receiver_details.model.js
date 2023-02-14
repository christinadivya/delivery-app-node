import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Shipment from '../models/shipment_details.model';
const Receiver = Schema.Bookshelf.Model.extend({
  tableName: 'receiver_details',
  hasTimestamps: true,

  user: function () {
    return this.hasMany(User);
  },
  
  shipment: function () {
    return this.belongsTo('Shipment','shipment_details_id');
  },
});

module.exports = Schema.Bookshelf.model('Receiver', Receiver);
