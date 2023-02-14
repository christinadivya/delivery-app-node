import Schema from '../../config/mysql.js';

const Country = Schema.Bookshelf.Model.extend({
  tableName: 'country_codes',
  hasTimestamps: true,
 
});

module.exports = Schema.Bookshelf.model('Country', Country);
