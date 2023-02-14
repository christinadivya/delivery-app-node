import express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/registration')
  .post(validate(paramValidation.createUser), authCtrl.create);

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), passport.authenticate('local', { session: false }), authCtrl.login);

router.route('/admin-login').post(validate(paramValidation.adminLogin),authCtrl.Login);

router.route('/forgot-password')
  .get(validate(paramValidation.forgotPassword),authCtrl.forgotPassword);

router.route('/resend-otp')
  .get(validate(paramValidation.resendOtp),authCtrl.resendOtp);


router.route('/verify-otp')
  .get(validate(paramValidation.verifyOtp),authCtrl.verifyOtp);

router.route('/verify-pass-otp')
  .get(authCtrl.verifyPassOtp);

router.route('/check-email')
  .get(authCtrl.checkEmail);

router.route('/check-number')
  .get(authCtrl.checkPhoneNumber);

router.route('/reset-password')
  .post(validate(paramValidation.resetPassword),authCtrl.resetPassword);

router.route('/social-login')
  .post(authCtrl.socialLogin);

router.route('/guest-login')
  .post(authCtrl.guestLogin);

router.route('/forgotPassword')
  .get(validate(paramValidation.adminforgotPassword),authCtrl.adminforgotPassword);

router.route('/resetPassword')
  .post(validate(paramValidation.adminresetPassword),authCtrl.adminresetPassword);

router.route('/resendOtp')
  .get(validate(paramValidation.adminresendOtp),authCtrl.adminresendOtp);

router.route('/chat_notification').post(authCtrl.chat_notification);


// router.route('/check-email').get(authCtrl.checkEmail);

// router.route('/check-username').get(authCtrl.checkUserName);

export default router;
