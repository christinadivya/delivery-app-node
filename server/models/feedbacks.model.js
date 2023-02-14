import Schema from '../../config/mysql.js';

const Feedback = Schema.Bookshelf.Model.extend({
  tableName: 'feedbacks',
  hasTimestamps: true,

});

module.exports = Schema.Bookshelf.model('Feedback', Feedback);
