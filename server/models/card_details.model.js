// Card Model
const Schema = require('../../config/mysql.js'); 
const User = require('../models/user.model');

const Card =Schema.Bookshelf.Model.extend({
    tableName: 'card_details',
    hasTimestamps: true,

      user: function () {
        return this.belongsTo(User);
      }

})

module.exports = Schema.Bookshelf.model('Card', Card);