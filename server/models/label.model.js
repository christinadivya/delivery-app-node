import Schema from '../../config/mysql.js';

const Label = Schema.Bookshelf.Model.extend({
  tableName: 'label',
  hasTimestamps: true,
 
});

module.exports = Schema.Bookshelf.model('Label', Label);
