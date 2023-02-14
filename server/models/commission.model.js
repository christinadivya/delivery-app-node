import Schema from '../../config/mysql.js';
import Country from '../models/country_codes.model';

const Commission = Schema.Bookshelf.Model.extend({
  tableName: 'commission',
  hasTimestamps: true,

  country: function () {
    return this.belongsTo('Country','country_id');
  }

});

module.exports = Schema.Bookshelf.model('Commission', Commission);
