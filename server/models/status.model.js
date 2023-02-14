import Schema from '../../config/mysql.js';

const Status = Schema.Bookshelf.Model.extend({
  tableName: 'status',
  hasTimestamps: true,

  user: function () {
    return this.hasMany(User);
  },
  
});

module.exports = Schema.Bookshelf.model('Status', Status);
