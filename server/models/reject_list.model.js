import Schema from '../../config/mysql.js';

const Reject = Schema.Bookshelf.Model.extend({
  tableName: 'reject_list',
  hasTimestamps: true,

});

module.exports = Schema.Bookshelf.model('Reject', Reject);
