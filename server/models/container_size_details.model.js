import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Container from '../models/container_details.model';
import Shipment from '../models/shipment_details.model';

const ContainerSize = Schema.Bookshelf.Model.extend({
  tableName: 'container_size_details',
  hasTimestamps: true,

  user: function () {
    return this.hasMany(User);
  },
  
  container_details: function () {
    return this.belongsTo('Container','container_details_id');
  },

  shipment: function () {
    return this.belongsTo('Shipment','shipment_details_id');
  },
});

module.exports = Schema.Bookshelf.model('ContainerSize', ContainerSize);
