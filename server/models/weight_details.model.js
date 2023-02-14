import Schema from '../../config/mysql.js';

const Weight = Schema.Bookshelf.Model.extend({
  tableName: 'weight_details',
  hasTimestamps: true,

  user: function () {
    return this.hasMany(User);
  },
  
});

module.exports = Schema.Bookshelf.model('Weight', Weight);
