import Schema from '../../config/mysql.js';
import UserVerifications from '../models/user_verification.model';
import moment from 'moment';


const Promise = require('bluebird');
const bcrypt = require('bcrypt');


const User = Schema.Bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  hidden: ['encrypted_password'],
  initialize() {
    this.on('creating', this.hashPassword);
    this.on('saving', this.validateExistingPhonenumber);
    this.on('updating', this.updatePassword);
    this.on('saving',this.validateExistingUsername);
    this.on('saving',this.validateExpireDate);
    return this.on('saving', this.validateExistingEmail);
  },

  user_verifications: function () {
    return this.hasOne(UserVerifications);
  },
  

  validateExistingEmail(model, attr, options) {
    if (this.hasChanged('email') && this.get('email') !== '') {
      return User.query('where', 'email', this.get('email'))
      .fetch()
      .then((existing) => {
        if (existing) {
          throw new Error('Email already exists');
        }
      });
    } else {
      return 0;
    }
  },
  validateExistingUsername(model, attr, options) {
    if (this.hasChanged('username')) {
      return User.query('where', 'username', this.get('username'))
      .fetch()
      .then((existing) => {
        if (existing) {
          throw new Error('Username already exists');
        }
      });
    }
  },
  validateExistingPhonenumber(model, attr, options) {
    console.log("#####")
    if (this.hasChanged('mobile')) {
      return User.query('where', 'mobile', this.get('mobile'))
      .fetch()
      .then((existing) => {
        if (existing) {
          throw new Error('Mobile Number already exists');
        }
      });
    }
  },

  validateExpireDate(model, attr, options) {
    if(this.hasChanged('govt_id_exp_date')) {
      let isafter = moment(model.get('govt_id_exp_date')).isAfter(new Date());
      console.log(isafter)
      if(isafter == false) {
         throw new Error('Government Id Date got expired')
        }
      }
  },

 

  hashPassword(model, attrs, options) {
    return new Promise((resolve, reject) => {
      if (model.has('password')) {
        return bcrypt.hash(model.get('password'), 10, (err, hash) => {
          if (err) { reject(err); }
          model.unset('confirm_password');
          model.set('password', hash);
          return resolve(hash);
        });
      } else {
        return resolve(null);
      }
    });
  },
  updatePassword(model, attrs, options) {
    console.log("&&&")
    return new Promise((resolve, reject) => {
      if (model.has('new_password')) {
        return bcrypt.hash(model.get('new_password'), 10, (err, hash) => {
          if (err) { reject(err); }
          model.unset('otp_code')
          model.unset('new_password');
          model.unset('confirm_password');
          model.set('password', hash);
          return resolve(hash);
        });
      } else {
        return resolve(null);
      }
    });
  },
}, {
  // Model static methods
  comparePassword: function (password, user, cb) {
    return bcrypt.compare(password, user.get('password'), (err, match) => {
      if (err) { cb(err); }
      if (match) { return cb(null, true); } else { return cb(err); }
    });
  }
}, {
  dependents: ['usersInfo']
});

module.exports = Schema.Bookshelf.model('User', User);
