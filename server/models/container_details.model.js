import Schema from '../../config/mysql.js';
import ContainerSize from '../models/container_size_details.model';

const Container = Schema.Bookshelf.Model.extend({
  tableName: 'container_details',
  hasTimestamps: true,

  container_size_details: function () {
    return this.hasMany('ContainerSize', 'container_details_id');
  },
});

module.exports = Schema.Bookshelf.model('Container', Container);
