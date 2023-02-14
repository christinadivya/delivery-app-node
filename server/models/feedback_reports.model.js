// Feedback Model
const Schema = require('../../config/mysql.js'); 
const User = require('../models/user.model');
const Shipment = require('../models/shipment_details.model');
const Feedback = require('../models/feedbacks.model');

const FeedbackReports =Schema.Bookshelf.Model.extend({
    tableName: 'feedback_reports',
    hasTimestamps: true,

    report_to: function () {
        return this.belongsTo(User,'report_to');
      },
    
    report_from: function () {
        return this.belongsTo(User,'report_from');
      },
    
    shipment: function () {
        return this.belongsTo(Shipment,'shipment_id');
      },

    feedback: function () {
      return this.belongsTo(Feedback,'feedback_id');
    },
})

module.exports = Schema.Bookshelf.model('FeedbackReports', FeedbackReports);