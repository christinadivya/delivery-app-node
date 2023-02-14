import Schema from '../../config/mysql.js';

const Location = Schema.Bookshelf.Model.extend({
  tableName: 'location',
  hasTimestamps: true,

});

module.exports = Schema.Bookshelf.model('Location', Location);
