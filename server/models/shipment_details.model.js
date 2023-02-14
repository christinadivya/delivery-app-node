import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Package from '../models/package_details.model';
import PackageDocument from '../models/package_document_details.model';
import ContainerSize from '../models/container_size_details.model';
import Weight from '../models/weight_details.model';
import Receiver from '../models/receiver_details.model';
import Request from '../models/request.model';
import Notifications from '../models/notifications.model';
import moment from 'moment';

const Shipment = Schema.Bookshelf.Model.extend({
  tableName: 'shipment_details',
  hasTimestamps: true,
  user: function () {
    return this.belongsTo('User','user_id');
  },

  package: function () {
    return this.hasMany('Package','shipment_details_id');
  },

  package_doc: function () {
    return this.hasMany('PackageDocument','shipment_details_id');
  },

  container_size_details: function () {
    return this.hasMany('ContainerSize','shipment_details_id');
  },

  weight_details: function () {
    return this.belongsTo('Weight', 'weight_details_id');
  },

  receiver_details: function () {
    return this.hasOne('Receiver','shipment_details_id');
  },

  receiver: function () {
    return this.belongsTo('User','receiver_id');
  },

  notification: function() {
    return this.hasMany('Notifications', 'shipment_details_id');
  },
  
  request: function() {
    return this.hasMany('Request', 'shipment_details_id');
  },

  initialize() {
    this.on('saving',this.validatePickupDate);
    this.on('saving',this.validateDropOffDate);
  },


  validatePickupDate(model, att, options) {
    console.log("###")
    if(this.hasChanged('pick_up_date')) {
      var date = new Date();
        let pick_date =new Date(model.get('pick_up_date'));
        if(moment(model.get('pick_up_date')).isSameOrAfter(new Date(), 'day')){
            console.log("todays_date");
            return 0;
        }
        else{
          if(date < pick_date) {
             console.log("future_date");
             return 0;
          }
          else {
           throw new Error('Pick Up Date should not allowed to be the past date');
          }
  
        }
      }
  },

  validateDropOffDate(model, att, options) {
    console.log("###")
    if(this.hasChanged('drop_off_date')) {
      var date = new Date();
      let drop_date =new Date(model.get('drop_off_date'));
      console.log(model.get('drop_off_date'))
        if(moment(model.get('drop_off_date')).isSameOrAfter(model.get('pick_up_date'), 'day')){
            console.log("todays_date");
            return 0;
        }
        else{
          // if(date > drop_date) {
          //    console.log("future_date");
          //    return 0;
          // }
          // else {
           throw new Error('The drop off date should be greater than or same as the pickup date');
          // }
  
        }
      }
  },
});

module.exports = Schema.Bookshelf.model('Shipment', Shipment);
