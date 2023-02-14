/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import User from '../server/models/user.model';
import UserVerifications from '../server/models/user_verification.model';
import Twilio from './twilio.js';


const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const tokenSecret = require('./config');
const LocalStrategy = require('passport-local').Strategy;

// Setup work and export for the JWT passport strategy

module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = tokenSecret.config.jwtSecret;
  opts.ignoreExpiration = true;

  passport.use('jwt', new JwtStrategy(opts, (jwt_payload, done) =>  {
    return User.forge({ id: jwt_payload.id }).fetch()
      .then((users) => {
        const user = {
          id: users.id,
          role_id: jwt_payload.role_id
        }
        done(null, user)
  }).catch(err => {
    console.log(err)
    done(err, false)});
  })
  );
  passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, (username, password, done) => {
    if (!username || !password) {
      return done({ err: 'Username and Password required' });
    }
    const criteria = (isNaN(username)) ? { username: username } : { mobile: username };
    return User.forge(criteria).fetch().then((user) => {
      if (!user) {
        return done({ message: 'Invalid Username/Mobile.', status: 400 },null);
      }
      if (user && user.attributes.is_user_active === 0) {

        let otp_code = Math.floor(100000 + Math.random() * 900000);
        let expired_date = new Date();
        expired_date.setHours(expired_date.getHours() + 8);
        UserVerifications.where({ mobile:  user.attributes.mobile }).fetch().then((otp) => {
          if(otp != null) {
            otp.save({ valid: 0 },{ patch: true }).then((updated) => {
              console.log("Valid made 0");
              UserVerifications.forge({otp_code: otp_code, expired_date: expired_date, user_id: user.attributes.id, mobile: user.attributes.mobile }).save().then ((otpuser) => {
                Twilio.sendSms(user.attributes.countrycode+user.attributes.mobile, "Verify OTP sent to your number"+
                  otpuser.attributes.otp_code);
                  return done({ message: otpuser.attributes.mobile,  status: 401 }, null);
              })
            })
          }
          else {
            UserVerifications.forge({otp_code: otp_code, expired_date: expired_date, user_id: user.attributes.id, mobile: user.attributes.mobile }).save().then ((otpuser) => {
              Twilio.sendSms(user.attributes.countrycode+user.attributes.mobile, "Verify OTP sent to your number"+
                otpuser.attributes.otp_code);
                return done({ message: otpuser.attributes.mobile,  status: 401 }, null);
            })
          }
        })
          
            //  return done(null, false, { message: 'bad password', mobile: 52});
            
      } 
      if(user && user.attributes.is_delete === 1) {
        return done({ message: 'Account Deleted',  status: 403 }, null);
      }else if(user && user.attributes.block === 1) {
        return done({ message: 'You have been blocked. Contact customer support',  status: 403 }, null);
      }
      else {
        return User.comparePassword(password, user, (err, valid) => {
          if (err) {
            return done({ message: 'Invalid Password', status: 400 }, null);
          }
          if (!valid) {
            return done({ message: 'Invalid Password', status: 400 }, null);
          } else {
            return done(null, user);
          }
        });
      }
    });
  })
 );
};
