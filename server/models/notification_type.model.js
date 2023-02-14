// Notification Type Model
const Schema = require('../../config/mysql.js'); 
const Notification = require('../models/user.model');

const NotificationType =Schema.Bookshelf.Model.extend({
    tableName: 'notification_type',
    hasTimestamps: true,

})

module.exports = Schema.Bookshelf.model('NotificationType', NotificationType);
