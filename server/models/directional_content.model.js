import Schema from '../../config/mysql.js';

const Content = Schema.Bookshelf.Model.extend({
  tableName: 'directional_content',
  hasTimestamps: true,
 
});

module.exports = Schema.Bookshelf.model('Content', Content);